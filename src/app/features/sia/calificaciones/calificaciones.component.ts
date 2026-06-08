import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/core/services/auth.service';
import { CalificacionService } from '@/features/sia/calificaciones/services/calificacion.service';
import { SiaService } from '@/core/services/sia.service';
import {
    ActividadEvaluativaRequest,
    ActividadEvaluativaResponse,
    AutoevaluacionTrimestralRequest,
    AutoevaluacionTrimestralResponse,
    BitacoraAuditoriaResponse,
    CalificacionActividadResponse,
    CalificacionAsignacionResponse,
    CalificacionSerRequest,
    CalificacionSerResponse,
    ConsolidadoTrimestralDirectorResponse,
    ConsolidadoTrimestralEstudianteResponse,
    ConsolidadoTrimestralMateriaResponse,
    CursoResponse,
    DocenteResponse,
    EstudianteResponse,
    GestionAcademicaResponse,
    MateriaResponse,
    ParaleloResponse,
} from '@/core/models/sia.models';

type TabCalificaciones = 'actividades' | 'notas' | 'ser' | 'autoevaluacion' | 'consolidado' | 'bitacora';

interface SerRow {
    idEstudiante: string;
    nombreCompleto: string;
    notaSer: number | null;
    observacion: string;
    estado: string;
}

@Component({
    selector: 'app-calificaciones',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TagModule,
        TableModule,
        TabsModule,
        TextareaModule,
        ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './calificaciones.component.html',
})
export class CalificacionesComponent implements OnInit {
    private readonly calificacionService = inject(CalificacionService);
    private readonly siaService = inject(SiaService);
    private readonly authService = inject(AuthService);
    private readonly messageService = inject(MessageService);

    gestiones = signal<GestionAcademicaResponse[]>([]);
    cursos = signal<CursoResponse[]>([]);
    paralelos = signal<ParaleloResponse[]>([]);
    materias = signal<MateriaResponse[]>([]);
    docentes = signal<DocenteResponse[]>([]);
    estudiantes = signal<EstudianteResponse[]>([]);
    asignacionesDisponibles = signal<CalificacionAsignacionResponse[]>([]);

    actividades = signal<ActividadEvaluativaResponse[]>([]);
    calificacionesActividad = signal<CalificacionActividadResponse[]>([]);
    ser = signal<CalificacionSerResponse[]>([]);
    serRows = signal<SerRow[]>([]);
    autoevaluaciones = signal<AutoevaluacionTrimestralResponse[]>([]);
    consolidadoDocente = signal<ConsolidadoTrimestralMateriaResponse[]>([]);
    consolidadoDirector = signal<ConsolidadoTrimestralDirectorResponse | null>(null);
    consolidadoEstudiante = signal<ConsolidadoTrimestralEstudianteResponse[]>([]);
    bitacora = signal<BitacoraAuditoriaResponse[]>([]);

    loadingCatalogos = false;
    loadingVista = false;
    loadingNotas = false;
    guardandoActividad = false;
    guardandoNotas = false;
    guardandoSer = false;
    guardandoAutoevaluacion = false;

    activeTab: TabCalificaciones = 'actividades';
    selectedActividadId = '';
    filtroGestion = '';
    filtroTrimestre = 1;
    filtroCurso = '';
    filtroParalelo = '';
    filtroMateria = '';
    filtroDocente = '';
    filtroEstudiante = '';

    actividadForm: ActividadEvaluativaRequest = this.nuevaActividadForm();
    autoevaluacionForm: AutoevaluacionTrimestralRequest = this.nuevaAutoevaluacionForm();

    readonly trimestres = [
        { label: '1er trimestre', value: 1 },
        { label: '2do trimestre', value: 2 },
        { label: '3er trimestre', value: 3 },
    ];

    readonly dimensionesActividad = [
        { label: 'SABER', value: 'SABER' },
        { label: 'HACER', value: 'HACER' },
    ];

    readonly estadosActividad = [
        { label: 'Borrador', value: 'BORRADOR' },
        { label: 'Activa', value: 'ACTIVA' },
    ];

    readonly tiposActividad = [
        { label: 'Examen', value: 'Examen' },
        { label: 'Trabajo practico', value: 'Trabajo practico' },
        { label: 'Exposicion', value: 'Exposicion' },
        { label: 'Tarea', value: 'Tarea' },
        { label: 'Proyecto', value: 'Proyecto' },
    ];

    readonly esEstudiante = computed(() => this.authService.hasRole('ESTUDIANTE'));
    readonly esDocente = computed(() => this.authService.hasRole('DOCENTE'));
    readonly esDirector = computed(() => this.authService.hasRole('DIRECTOR') || this.authService.hasRole('ADMIN_INSTITUCION') || this.authService.hasRole('SUPER_ADMIN'));

    readonly gestionesOptions = computed(() => this.gestiones().map((gestion) => ({ label: gestion.nombre, value: gestion.id })));
    readonly cursosOptions = computed(() => this.cursos().map((curso) => ({ label: curso.nombre, value: curso.id })));
    readonly materiasOptions = computed(() => this.materias().map((materia) => ({ label: `${materia.codigo} - ${materia.nombre}`, value: materia.id })));
    readonly docentesOptions = computed(() => this.docentes().map((docente) => ({ label: `${docente.apellidos}, ${docente.nombres}`, value: docente.id })));
    readonly estudiantesOptions = computed(() => this.estudiantes().map((estudiante) => ({ label: `${estudiante.codigoEstudiante} - ${estudiante.apellidos}, ${estudiante.nombres}`, value: estudiante.id })));
    readonly actividadesOptions = computed(() => this.actividades().map((actividad) => ({
        label: `${actividad.nombreActividad} - ${actividad.dimension} /${actividad.puntajeMaximo}`,
        value: actividad.id,
    })));

    readonly actividadesSaber = computed(() => this.actividades().filter((a) => a.dimension === 'SABER'));
    readonly actividadesHacer = computed(() => this.actividades().filter((a) => a.dimension === 'HACER'));
    readonly selectedActividad = computed(() => this.actividades().find((a) => a.id === this.selectedActividadId) ?? null);
    readonly materiaConsolidada = computed(() => this.consolidadoDocente().find((m) => m.idMateria === this.filtroMateria) ?? null);
    readonly estudiantesConsolidado = computed(() => this.materiaConsolidada()?.estudiantes ?? this.consolidadoEstudiante());

    readonly totalEstudiantesContexto = computed(() => {
        const ids = new Set<string>();
        this.estudiantes().forEach((e) => ids.add(e.id));
        this.ser().forEach((s) => ids.add(s.idEstudiante));
        this.autoevaluaciones().forEach((a) => ids.add(a.idEstudiante));
        this.calificacionesActividad().forEach((c) => ids.add(c.idEstudiante));
        this.estudiantesConsolidado().forEach((e) => ids.add(e.idEstudiante));
        return ids.size;
    });

    readonly indicadores = computed(() => {
        const total = this.totalEstudiantesContexto();
        const serRegistrados = this.ser().filter((s) => s.notaSer !== null && s.notaSer !== undefined).length;
        const autosRegistradas = this.autoevaluaciones().filter((a) => a.notaAutoevaluacion !== null && a.notaAutoevaluacion !== undefined).length;
        const consolidadosCompletos = this.estudiantesConsolidado().filter((e) => this.estadoConsolidado(e) === 'Completo').length;

        return {
            saber: this.actividadesSaber().length,
            hacer: this.actividadesHacer().length,
            serRegistrados,
            total,
            autosPendientes: Math.max(total - autosRegistradas, 0),
            consolidadosCompletos,
        };
    });

    get paralelosFiltrados(): ParaleloResponse[] {
        return this.paralelos().filter((paralelo) =>
            (!this.filtroCurso || paralelo.idCurso === this.filtroCurso) &&
            (!this.filtroGestion || paralelo.idGestionAcademica === this.filtroGestion)
        );
    }

    get puntajeActividad(): number {
        return this.actividadForm.dimension === 'HACER' ? 40 : 45;
    }

    ngOnInit(): void {
        this.cargarCatalogos();
    }

    cargarCatalogos(): void {
        this.loadingCatalogos = true;

        if (this.esDocente()) {
            this.calificacionService.listarMisAsignaciones().subscribe({
                next: (response) => {
                    this.loadingCatalogos = false;
                    if (response.codigo !== 200) {
                        this.showWarn(response.mensaje || 'No se pudieron cargar tus asignaciones');
                        return;
                    }
                    this.cargarCatalogosDesdeAsignaciones(response.data ?? []);
                    this.inicializarFiltros();
                    this.recargarContexto();
                },
                error: () => {
                    this.loadingCatalogos = false;
                    this.showError('No se pudieron cargar tus asignaciones');
                },
            });
            return;
        }

        forkJoin({
            gestiones: this.siaService.listarGestiones(),
            cursos: this.siaService.listarCursos(),
            paralelos: this.siaService.listarParalelos(),
            materias: this.siaService.listarMaterias(),
            docentes: this.siaService.listarDocentes(),
            estudiantes: this.siaService.listarEstudiantes(),
        }).subscribe({
            next: (resultado) => {
                this.loadingCatalogos = false;
                if (resultado.gestiones.codigo === 200) this.gestiones.set(resultado.gestiones.data ?? []);
                if (resultado.cursos.codigo === 200) this.cursos.set(resultado.cursos.data ?? []);
                if (resultado.paralelos.codigo === 200) this.paralelos.set(resultado.paralelos.data ?? []);
                if (resultado.materias.codigo === 200) this.materias.set(resultado.materias.data ?? []);
                if (resultado.docentes.codigo === 200) this.docentes.set(resultado.docentes.data ?? []);
                if (resultado.estudiantes.codigo === 200) this.estudiantes.set(resultado.estudiantes.data ?? []);
                this.inicializarFiltros();
                this.recargarContexto();
            },
            error: () => {
                this.loadingCatalogos = false;
                this.showError('No se pudieron cargar los catalogos de SIA');
            },
        });
    }

    recargarContexto(): void {
        this.sincronizarFormulariosConFiltros();
        this.limpiarDatosContexto();
        this.cargarVista();
        this.cargarConsolidado(false);
        this.cargarBitacora(false);
    }

    cargarVista(): void {
        if (!this.filtroGestion || !this.filtroMateria) return;

        this.loadingVista = true;
        forkJoin({
            actividades: this.calificacionService.listarActividadesTrimestrales(this.filtroGestion, this.filtroTrimestre, {
                idCurso: this.filtroCurso || undefined,
                idParalelo: this.filtroParalelo || undefined,
                idMateria: this.filtroMateria || undefined,
            }),
            ser: this.calificacionService.listarSerTrimestral(this.filtroGestion, this.filtroTrimestre, this.filtroMateria),
            autoevaluaciones: this.calificacionService.listarAutoevaluacionTrimestral(this.filtroGestion, this.filtroTrimestre, this.filtroMateria),
        }).subscribe({
            next: (resultado) => {
                this.loadingVista = false;
                if (resultado.actividades.codigo === 200) this.actividades.set(resultado.actividades.data ?? []);
                if (resultado.ser.codigo === 200) this.ser.set(this.filtrarPorContexto(resultado.ser.data ?? []));
                if (resultado.autoevaluaciones.codigo === 200) this.autoevaluaciones.set(resultado.autoevaluaciones.data ?? []);
                if (!this.selectedActividadId && this.actividades().length) {
                    this.selectedActividadId = this.actividades()[0].id;
                    this.cargarNotasActividad();
                }
                this.reconstruirSerRows();
            },
            error: () => {
                this.loadingVista = false;
                this.showError('No se pudo cargar la vista trimestral');
            },
        });
    }

    cargarNotasActividad(): void {
        if (!this.selectedActividadId) {
            this.calificacionesActividad.set([]);
            return;
        }

        this.loadingNotas = true;
        this.calificacionService.listarCalificacionesActividadTrimestral(this.selectedActividadId).subscribe({
            next: (response) => {
                this.loadingNotas = false;
                if (response.codigo === 200) {
                    this.calificacionesActividad.set(response.data ?? []);
                    this.reconstruirSerRows();
                    return;
                }
                this.showWarn(response.mensaje || 'No se pudieron cargar las notas');
            },
            error: () => {
                this.loadingNotas = false;
                this.showError('No se pudieron cargar las notas de la actividad');
            },
        });
    }

    cargarConsolidado(showToast = true): void {
        if (!this.filtroGestion) return;

        if (this.esEstudiante()) {
            const idEstudiante = this.filtroEstudiante || this.estudiantes()[0]?.id;
            if (!idEstudiante) return;
            this.calificacionService.consolidadoEstudianteTrimestral(this.filtroGestion, this.filtroTrimestre, idEstudiante).subscribe({
                next: (response) => {
                    if (response.codigo === 200) this.consolidadoEstudiante.set(this.filtrarConsolidadoEstudiante(response.data ?? []));
                    else if (showToast) this.showWarn(response.mensaje || 'No se pudo cargar el consolidado');
                    this.reconstruirSerRows();
                },
                error: () => showToast && this.showError('No se pudo cargar el consolidado del estudiante'),
            });
            return;
        }

        if (this.esDocente()) {
            this.calificacionService.consolidadoDocenteTrimestral(this.filtroGestion, this.filtroTrimestre).subscribe({
                next: (response) => {
                    if (response.codigo === 200) this.consolidadoDocente.set(this.filtrarConsolidadoMaterias(response.data ?? []));
                    else if (showToast) this.showWarn(response.mensaje || 'No se pudo cargar el consolidado');
                    this.reconstruirSerRows();
                },
                error: () => showToast && this.showError('No se pudo cargar el consolidado del docente'),
            });
            return;
        }

        this.calificacionService.consolidadoDirectorTrimestral(this.filtroGestion, this.filtroTrimestre).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    const data = response.data ?? null;
                    this.consolidadoDirector.set(data ? { ...data, materias: this.filtrarConsolidadoMaterias(data.materias ?? []) } : null);
                    this.consolidadoDocente.set(this.consolidadoDirector()?.materias ?? []);
                } else if (showToast) {
                    this.showWarn(response.mensaje || 'No se pudo cargar el consolidado directivo');
                }
                this.reconstruirSerRows();
            },
            error: () => showToast && this.showError('No se pudo cargar el consolidado directivo'),
        });
    }

    cargarBitacora(showToast = true): void {
        this.calificacionService.listarBitacoraTrimestral({ modulo: 'CALIFICACIONES_TRIMESTRALES' }).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    this.bitacora.set(response.data ?? []);
                    return;
                }
                if (showToast) this.showWarn(response.mensaje || 'No se pudo cargar la bitacora');
            },
            error: () => showToast && this.showError('No se pudo cargar la bitacora'),
        });
    }

    guardarActividad(): void {
        if (!this.actividadForm.nombreActividad?.trim() || !this.actividadForm.tipoActividad?.trim()) {
            this.showWarn('Completa nombre y tipo de actividad');
            return;
        }
        if (!['SABER', 'HACER'].includes(this.actividadForm.dimension)) {
            this.showWarn('Solo se pueden crear actividades SABER o HACER');
            return;
        }

        this.sincronizarFormulariosConFiltros();
        const payload = this.buildActividadPayload();
        this.guardandoActividad = true;
        this.calificacionService.crearActividadTrimestral(payload).subscribe({
            next: (response) => {
                this.guardandoActividad = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudo crear la actividad');
                    return;
                }
                this.showSuccess('Actividad guardada');
                this.actividadForm = this.nuevaActividadForm();
                this.sincronizarFormulariosConFiltros();
                this.recargarContexto();
            },
            error: () => {
                this.guardandoActividad = false;
                this.showError('No se pudo crear la actividad');
            },
        });
    }

    guardarNotasActividad(): void {
        const actividad = this.selectedActividad();
        if (!actividad) {
            this.showWarn('Selecciona una actividad evaluativa');
            return;
        }
        const invalida = this.calificacionesActividad().some((row) =>
            row.notaObtenida !== null &&
            row.notaObtenida !== undefined &&
            (row.notaObtenida < 0 || row.notaObtenida > actividad.puntajeMaximo)
        );
        if (invalida) {
            this.showWarn(`Las notas deben estar entre 0 y ${actividad.puntajeMaximo}`);
            return;
        }

        this.guardandoNotas = true;
        this.calificacionService.guardarCalificacionesActividadTrimestral({
            idActividad: actividad.id,
            detalles: this.calificacionesActividad().map((row) => ({
                idEstudiante: row.idEstudiante,
                notaObtenida: row.notaObtenida,
                observacion: row.observacion,
            })),
        }).subscribe({
            next: (response) => {
                this.guardandoNotas = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudieron guardar las notas');
                    return;
                }
                this.showSuccess('Notas guardadas');
                this.calificacionesActividad.set(response.data ?? []);
                this.cargarConsolidado(false);
            },
            error: () => {
                this.guardandoNotas = false;
                this.showError('No se pudieron guardar las notas');
            },
        });
    }

    guardarSerMasivo(): void {
        const invalid = this.serRows().some((row) => row.notaSer !== null && (row.notaSer < 0 || row.notaSer > 10));
        if (invalid) {
            this.showWarn('La nota SER debe estar entre 0 y 10');
            return;
        }

        const rows = this.serRows().filter((row) => row.notaSer !== null && row.notaSer !== undefined);
        if (!rows.length) {
            this.showWarn('No hay notas SER para guardar');
            return;
        }

        this.guardandoSer = true;
        const requests = rows.map((row) => this.calificacionService.guardarSerTrimestral(this.buildSerRequest(row)));
        forkJoin(requests).subscribe({
            next: () => {
                this.guardandoSer = false;
                this.showSuccess('SER guardado');
                this.recargarContexto();
            },
            error: () => {
                this.guardandoSer = false;
                this.showError('No se pudo guardar SER');
            },
        });
    }

    guardarAutoevaluacion(): void {
        if (!this.esEstudiante()) {
            this.showWarn('La autoevaluacion solo puede registrarla el estudiante');
            return;
        }
        if (this.autoevaluacionForm.notaAutoevaluacion < 0 || this.autoevaluacionForm.notaAutoevaluacion > 5) {
            this.showWarn('La autoevaluacion debe estar entre 0 y 5');
            return;
        }

        this.sincronizarFormulariosConFiltros();
        this.guardandoAutoevaluacion = true;
        this.calificacionService.guardarAutoevaluacionTrimestral(this.autoevaluacionForm).subscribe({
            next: (response) => {
                this.guardandoAutoevaluacion = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudo registrar la autoevaluacion');
                    return;
                }
                this.showSuccess('Autoevaluacion registrada');
                this.recargarContexto();
            },
            error: () => {
                this.guardandoAutoevaluacion = false;
                this.showError('No se pudo registrar la autoevaluacion');
            },
        });
    }

    cerrarActividad(actividad: ActividadEvaluativaResponse): void {
        this.calificacionService.cambiarEstadoActividadTrimestral(actividad.id, 'CERRADA').subscribe({
            next: () => {
                this.showSuccess('Actividad cerrada');
                this.recargarContexto();
            },
            error: () => this.showError('No se pudo cerrar la actividad'),
        });
    }

    eliminarActividad(actividad: ActividadEvaluativaResponse): void {
        const confirmar = window.confirm(`Eliminar la actividad "${actividad.nombreActividad}"?`);
        if (!confirmar) return;

        this.calificacionService.eliminarActividadTrimestral(actividad.id).subscribe({
            next: (response) => {
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo eliminar la actividad');
                    return;
                }
                this.showSuccess('Actividad eliminada');
                if (this.selectedActividadId === actividad.id) this.selectedActividadId = '';
                this.recargarContexto();
            },
            error: (error) => this.showError(error?.error?.mensaje || 'No se pudo eliminar la actividad'),
        });
    }

    onFiltroChange(): void {
        this.inicializarFiltros(false);
        this.recargarContexto();
    }

    onCursoChange(): void {
        this.filtroParalelo = '';
        this.onFiltroChange();
    }

    onGestionChange(): void {
        this.filtroParalelo = '';
        this.onFiltroChange();
    }

    onDimensionChange(): void {
        if (!['SABER', 'HACER'].includes(this.actividadForm.dimension)) {
            this.actividadForm.dimension = 'SABER';
        }
    }

    getNombreEstudiante(idEstudiante: string): string {
        const estudiante = this.estudiantes().find((e) => e.id === idEstudiante);
        if (estudiante) return `${estudiante.apellidos}, ${estudiante.nombres}`;
        const consolidado = this.estudiantesConsolidado().find((e) => e.idEstudiante === idEstudiante);
        return consolidado?.nombreCompleto ?? idEstudiante;
    }

    getFecha(value?: string | null): string {
        if (!value) return '';
        return new Date(value).toLocaleDateString('es-BO');
    }

    getFechaHora(value?: string | null): string {
        if (!value) return '';
        return new Date(value).toLocaleString('es-BO');
    }

    estadoConsolidado(row: ConsolidadoTrimestralEstudianteResponse): string {
        if (row.ser === null || row.ser === undefined) return 'Falta SER';
        if (row.promedioSaber === null || row.promedioSaber === undefined) return 'Falta SABER';
        if (row.promedioHacer === null || row.promedioHacer === undefined) return 'Falta HACER';
        if (row.autoevaluacion === null || row.autoevaluacion === undefined) return 'Falta autoevaluacion';
        return 'Completo';
    }

    severityEstado(estado?: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        const normalizado = (estado ?? '').toUpperCase();
        if (['ACTIVA', 'ACTIVO', 'REGISTRADA', 'REGISTRADO', 'COMPLETO', 'APROBADO'].includes(normalizado)) return 'success';
        if (['PENDIENTE', 'BORRADOR', 'INCOMPLETO'].includes(normalizado) || normalizado.startsWith('FALTA')) return 'warn';
        if (['CERRADA', 'CERRADO', 'ANULADA', 'ERROR', 'EN_RIESGO'].includes(normalizado)) return 'danger';
        return 'secondary';
    }

    private inicializarFiltros(resetParalelo = true): void {
        if (!this.filtroGestion && this.gestiones().length) this.filtroGestion = this.gestiones()[0].id;
        if (!this.filtroCurso && this.cursos().length) this.filtroCurso = this.cursos()[0].id;
        if (resetParalelo && !this.filtroParalelo && this.paralelosFiltrados.length) this.filtroParalelo = this.paralelosFiltrados[0].id;
        if (!this.filtroMateria && this.materias().length) this.filtroMateria = this.materias()[0].id;
        if (!this.filtroDocente && this.docentes().length) this.filtroDocente = this.docentes()[0].id;
        if (!this.filtroEstudiante && this.estudiantes().length) this.filtroEstudiante = this.estudiantes()[0].id;
        if (!this.filtroParalelo && this.paralelosFiltrados.length) this.filtroParalelo = this.paralelosFiltrados[0].id;
        this.ajustarAsignacionDocente();
        this.sincronizarFormulariosConFiltros();
    }

    private sincronizarFormulariosConFiltros(): void {
        this.ajustarAsignacionDocente();
        this.actividadForm = {
            ...this.actividadForm,
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idCurso: this.filtroCurso,
            idParalelo: this.filtroParalelo,
            idMateria: this.filtroMateria,
            idDocente: this.filtroDocente || this.docentes()[0]?.id || '',
        };
        this.autoevaluacionForm = {
            ...this.autoevaluacionForm,
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idMateria: this.filtroMateria,
            idEstudiante: this.filtroEstudiante || this.autoevaluacionForm.idEstudiante,
        };
    }

    private ajustarAsignacionDocente(): void {
        if (!this.esDocente()) return;

        const asignaciones = this.asignacionesDisponibles();
        if (!asignaciones.length) return;

        const asignacion =
            asignaciones.find((item) =>
                (!this.filtroGestion || item.idGestion === this.filtroGestion) &&
                (!this.filtroCurso || item.idCurso === this.filtroCurso) &&
                (!this.filtroParalelo || item.idParalelo === this.filtroParalelo) &&
                (!this.filtroMateria || item.idMateria === this.filtroMateria)
            ) ??
            asignaciones.find((item) => !this.filtroGestion || item.idGestion === this.filtroGestion) ??
            asignaciones[0];

        this.filtroGestion = asignacion.idGestion;
        this.filtroCurso = asignacion.idCurso;
        this.filtroParalelo = asignacion.idParalelo;
        this.filtroMateria = asignacion.idMateria;
        this.filtroDocente = asignacion.idDocente;
    }

    private limpiarDatosContexto(): void {
        this.actividades.set([]);
        this.calificacionesActividad.set([]);
        this.ser.set([]);
        this.serRows.set([]);
        this.autoevaluaciones.set([]);
        this.consolidadoDocente.set([]);
        this.consolidadoDirector.set(null);
        this.consolidadoEstudiante.set([]);
        this.selectedActividadId = '';
    }

    private reconstruirSerRows(): void {
        const ids = new Set<string>();
        this.estudiantesConsolidado().forEach((e) => ids.add(e.idEstudiante));
        this.calificacionesActividad().forEach((e) => ids.add(e.idEstudiante));
        this.ser().forEach((e) => ids.add(e.idEstudiante));
        if (!ids.size && !this.esDocente()) this.estudiantes().forEach((e) => ids.add(e.id));

        const rows = Array.from(ids).map((idEstudiante) => {
            const ser = this.ser().find((s) => s.idEstudiante === idEstudiante);
            return {
                idEstudiante,
                nombreCompleto: this.getNombreEstudiante(idEstudiante),
                notaSer: ser?.notaSer ?? null,
                observacion: ser?.observacionFinal ?? '',
                estado: ser?.estado ?? 'PENDIENTE',
            };
        });
        this.serRows.set(rows);
    }

    private buildSerRequest(row: SerRow): CalificacionSerRequest {
        return {
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idCurso: this.filtroCurso,
            idParalelo: this.filtroParalelo,
            idMateria: this.filtroMateria,
            idDocente: this.filtroDocente || this.docentes()[0]?.id || '',
            idEstudiante: row.idEstudiante,
            notaSer: row.notaSer ?? 0,
            observacion: row.observacion,
        };
    }

    private filtrarPorContexto(items: CalificacionSerResponse[]): CalificacionSerResponse[] {
        return items.filter((item) =>
            (!this.filtroMateria || item.idMateria === this.filtroMateria)
        );
    }

    private filtrarConsolidadoMaterias(items: ConsolidadoTrimestralMateriaResponse[]): ConsolidadoTrimestralMateriaResponse[] {
        return items.filter((item) =>
            (!this.filtroMateria || item.idMateria === this.filtroMateria) &&
            (!this.filtroDocente || item.idDocente === this.filtroDocente || this.esDocente())
        );
    }

    private filtrarConsolidadoEstudiante(items: ConsolidadoTrimestralEstudianteResponse[]): ConsolidadoTrimestralEstudianteResponse[] {
        return items.filter((item) => !this.filtroEstudiante || item.idEstudiante === this.filtroEstudiante);
    }

    private cargarCatalogosDesdeAsignaciones(asignaciones: CalificacionAsignacionResponse[]): void {
        this.asignacionesDisponibles.set(asignaciones);
        this.gestiones.set(this.uniqueBy(asignaciones, (a) => a.idGestion).map((a) => ({
            id: a.idGestion,
            idInstitucion: '',
            nombre: a.nombreGestion,
            fechaInicio: '',
            fechaFin: '',
            activa: true,
            estado: 'ACTIVA',
            creadoEn: '',
        })));
        this.cursos.set(this.uniqueBy(asignaciones, (a) => a.idCurso).map((a) => ({
            id: a.idCurso,
            idInstitucion: '',
            codigo: a.nombreCurso,
            nombre: a.nombreCurso,
            estado: 'ACTIVO',
        })));
        this.paralelos.set(this.uniqueBy(asignaciones, (a) => a.idParalelo).map((a) => ({
            id: a.idParalelo,
            idInstitucion: '',
            idCurso: a.idCurso,
            idGestionAcademica: a.idGestion,
            nombre: a.nombreParalelo,
            estado: a.estado,
        })));
        this.materias.set(this.uniqueBy(asignaciones, (a) => a.idMateria).map((a) => ({
            id: a.idMateria,
            idInstitucion: '',
            codigo: a.codigoMateria,
            nombre: a.nombreMateria,
            estado: 'ACTIVA',
        })));
        this.docentes.set(this.uniqueBy(asignaciones, (a) => a.idDocente).map((a) => ({
            id: a.idDocente,
            idInstitucion: '',
            codigo: a.codigoDocente,
            documentoIdentidad: '',
            nombres: a.nombreDocente,
            apellidos: '',
            correo: '',
            estado: 'ACTIVO',
        })));
        this.estudiantes.set([]);
    }

    private uniqueBy<T>(items: T[], keySelector: (item: T) => string): T[] {
        const map = new Map<string, T>();
        for (const item of items) {
            const key = keySelector(item);
            if (key && !map.has(key)) map.set(key, item);
        }
        return Array.from(map.values());
    }

    private nuevaActividadForm(): ActividadEvaluativaRequest {
        return {
            idGestionAcademica: '',
            trimestre: 1,
            idCurso: '',
            idParalelo: '',
            idMateria: '',
            idDocente: '',
            nombreActividad: '',
            tipoActividad: '',
            dimension: 'SABER',
            fechaActividad: this.fechaActualInput(),
            descripcion: '',
            estado: 'ACTIVA',
        };
    }

    private buildActividadPayload(): ActividadEvaluativaRequest {
        return {
            ...this.actividadForm,
            fechaActividad: this.normalizarFechaActividadParaApi(this.actividadForm.fechaActividad),
        };
    }

    private normalizarFechaActividadParaApi(fecha?: string | null): string | undefined {
        if (!fecha) return undefined;
        if (fecha.includes('T')) return fecha;
        return `${fecha}T12:00:00.000Z`;
    }

    private fechaActualInput(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private nuevaAutoevaluacionForm(): AutoevaluacionTrimestralRequest {
        return {
            idGestionAcademica: '',
            trimestre: 1,
            idMateria: '',
            idEstudiante: '',
            notaAutoevaluacion: 0,
            comentario: '',
        };
    }

    showSuccess(detail: string): void {
        this.messageService.add({ severity: 'success', summary: 'OK', detail });
    }

    showWarn(detail: string): void {
        this.messageService.add({ severity: 'warn', summary: 'Atencion', detail });
    }

    showError(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
    }
}
