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
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/core/services/auth.service';
import { CalificacionService } from '@/core/services/calificacion.service';
import { SiaService } from '@/core/services/sia.service';
import {
    ActividadEvaluativaRequest,
    ActividadEvaluativaResponse,
    AutoevaluacionTrimestralRequest,
    AutoevaluacionTrimestralResponse,
    BitacoraAuditoriaResponse,
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

    actividades = signal<ActividadEvaluativaResponse[]>([]);
    ser = signal<CalificacionSerResponse[]>([]);
    autoevaluaciones = signal<AutoevaluacionTrimestralResponse[]>([]);
    consolidadoDocente = signal<ConsolidadoTrimestralMateriaResponse[]>([]);
    consolidadoDirector = signal<ConsolidadoTrimestralDirectorResponse | null>(null);
    consolidadoEstudiante = signal<ConsolidadoTrimestralEstudianteResponse[]>([]);
    bitacora = signal<BitacoraAuditoriaResponse[]>([]);

    loadingCatalogos = false;
    loadingVista = false;
    guardandoActividad = false;
    guardandoSer = false;
    guardandoAutoevaluacion = false;

    filtroGestion = '';
    filtroTrimestre = 1;
    filtroCurso = '';
    filtroParalelo = '';
    filtroMateria = '';
    filtroEstudiante = '';

    justificacionCierre = '';
    justificacionReapertura = '';

    actividadForm: ActividadEvaluativaRequest = this.nuevaActividadForm();
    serForm: CalificacionSerRequest = this.nuevoSerForm();
    autoevaluacionForm: AutoevaluacionTrimestralRequest = this.nuevaAutoevaluacionForm();

    readonly trimestres = [
        { label: '1er trimestre', value: 1 },
        { label: '2do trimestre', value: 2 },
        { label: '3er trimestre', value: 3 },
    ];

    readonly dimensiones = [
        { label: 'SER', value: 'SER' },
        { label: 'SABER', value: 'SABER' },
        { label: 'HACER', value: 'HACER' },
    ];

    readonly estadosActividad = [
        { label: 'Borrador', value: 'BORRADOR' },
        { label: 'Activa', value: 'ACTIVA' },
    ];

    readonly esEstudiante = computed(() => this.authService.hasRole('ESTUDIANTE'));
    readonly esDocente = computed(() => this.authService.hasRole('DOCENTE'));

    readonly gestionesOptions = computed(() => this.gestiones().map((gestion) => ({ label: gestion.nombre, value: gestion.id })));
    readonly cursosOptions = computed(() => this.cursos().map((curso) => ({ label: curso.nombre, value: curso.id })));
    readonly materiasOptions = computed(() => this.materias().map((materia) => ({ label: `${materia.codigo} - ${materia.nombre}`, value: materia.id })));
    readonly docentesOptions = computed(() => this.docentes().map((docente) => ({ label: `${docente.apellidos}, ${docente.nombres}`, value: docente.id })));
    readonly estudiantesOptions = computed(() => this.estudiantes().map((estudiante) => ({ label: `${estudiante.codigoEstudiante} - ${estudiante.apellidos}, ${estudiante.nombres}`, value: estudiante.id })));

    get paralelosFiltrados(): ParaleloResponse[] {
        return this.paralelos().filter((paralelo) => !this.filtroCurso || paralelo.idCurso === this.filtroCurso);
    }

    ngOnInit(): void {
        this.cargarCatalogos();
    }

    cargarCatalogos(): void {
        this.loadingCatalogos = true;
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
                this.autocompletarFiltros();
                this.cargarVista();
            },
            error: () => {
                this.loadingCatalogos = false;
                this.showError('No se pudieron cargar los catálogos de SIA');
            },
        });
    }

    cargarVista(): void {
        if (!this.filtroGestion || !this.filtroMateria) {
            this.actividades.set([]);
            this.ser.set([]);
            this.autoevaluaciones.set([]);
            return;
        }

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
                if (resultado.ser.codigo === 200) this.ser.set(resultado.ser.data ?? []);
                if (resultado.autoevaluaciones.codigo === 200) this.autoevaluaciones.set(resultado.autoevaluaciones.data ?? []);
            },
            error: () => {
                this.loadingVista = false;
                this.showError('No se pudo cargar la vista trimestral');
            },
        });
    }

    cargarConsolidado(): void {
        if (!this.filtroGestion || !this.filtroMateria) {
            this.showWarn('Selecciona gestión y materia');
            return;
        }

        if (this.esEstudiante()) {
            if (!this.filtroEstudiante) {
                this.showWarn('Selecciona un estudiante');
                return;
            }
            this.calificacionService.consolidadoEstudianteTrimestral(this.filtroGestion, this.filtroTrimestre, this.filtroEstudiante).subscribe({
                next: (response) => {
                    if (response.codigo === 200) {
                        this.consolidadoEstudiante.set(response.data ?? []);
                        this.consolidadoDocente.set([]);
                        this.consolidadoDirector.set(null);
                        return;
                    }
                    this.showWarn(response.mensaje || 'No se pudo cargar el consolidado');
                },
                error: () => this.showError('No se pudo cargar el consolidado del estudiante'),
            });
            return;
        }

        if (this.esDocente()) {
            this.calificacionService.consolidadoDocenteTrimestral(this.filtroGestion, this.filtroTrimestre).subscribe({
                next: (response) => {
                    if (response.codigo === 200) {
                        this.consolidadoDocente.set(response.data ?? []);
                        this.consolidadoEstudiante.set([]);
                        this.consolidadoDirector.set(null);
                        return;
                    }
                    this.showWarn(response.mensaje || 'No se pudo cargar el consolidado');
                },
                error: () => this.showError('No se pudo cargar el consolidado del docente'),
            });
            return;
        }

        this.calificacionService.consolidadoDirectorTrimestral(this.filtroGestion, this.filtroTrimestre).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    this.consolidadoDirector.set(response.data ?? null);
                    this.consolidadoDocente.set([]);
                    this.consolidadoEstudiante.set([]);
                    return;
                }
                this.showWarn(response.mensaje || 'No se pudo cargar el consolidado');
            },
            error: () => this.showError('No se pudo cargar el consolidado directivo'),
        });
    }

    guardarActividad(): void {
        this.guardandoActividad = true;
        this.calificacionService.crearActividadTrimestral(this.actividadForm).subscribe({
            next: (response) => {
                this.guardandoActividad = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudo crear la actividad');
                    return;
                }
                this.showSuccess('Actividad trimestral creada');
                this.actividadForm = this.nuevaActividadForm();
                this.cargarVista();
            },
            error: () => {
                this.guardandoActividad = false;
                this.showError('No se pudo crear la actividad');
            },
        });
    }

    guardarSer(): void {
        this.guardandoSer = true;
        this.calificacionService.guardarSerTrimestral(this.serForm).subscribe({
            next: (response) => {
                this.guardandoSer = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudo registrar SER');
                    return;
                }
                this.showSuccess('SER registrado');
                this.cargarVista();
            },
            error: () => {
                this.guardandoSer = false;
                this.showError('No se pudo registrar SER');
            },
        });
    }

    guardarAutoevaluacion(): void {
        this.guardandoAutoevaluacion = true;
        this.calificacionService.guardarAutoevaluacionTrimestral(this.autoevaluacionForm).subscribe({
            next: (response) => {
                this.guardandoAutoevaluacion = false;
                if (response.codigo !== 200 && response.codigo !== 201) {
                    this.showWarn(response.mensaje || 'No se pudo registrar la autoevaluación');
                    return;
                }
                this.showSuccess('Autoevaluación registrada');
                this.cargarVista();
            },
            error: () => {
                this.guardandoAutoevaluacion = false;
                this.showError('No se pudo registrar la autoevaluación');
            },
        });
    }

    cerrarTrimestre(): void {
        this.calificacionService.cerrarTrimestre({
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            justificacion: this.justificacionCierre,
        }).subscribe({
            next: (response) => response.codigo === 200 ? this.showSuccess('Trimestre cerrado') : this.showWarn(response.mensaje || 'No se pudo cerrar el trimestre'),
            error: () => this.showError('No se pudo cerrar el trimestre'),
        });
    }

    puedeEditarNotas(): boolean {
        const plantilla = this.plantilla();
        if (!plantilla) return false;
        return plantilla.puedeEditar && (
            this.authService.hasRole('DOCENTE')
            || this.authService.hasRole('ADMIN_INSTITUCION')
            || this.authService.hasRole('DIRECTOR')
            || this.authService.hasRole('SUPER_ADMIN')
            || this.authService.hasPermission('CALIFICACIONES_WRITE')
        );
    }

    reabrirTrimestre(): void {
        this.calificacionService.reabrirTrimestre({
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            justificacion: this.justificacionReapertura,
        }).subscribe({
            next: (response) => response.codigo === 200 ? this.showSuccess('Trimestre reabierto') : this.showWarn(response.mensaje || 'No se pudo reabrir el trimestre'),
            error: () => this.showError('No se pudo reabrir el trimestre'),
        });
    }

    cargarBitacora(): void {
        this.calificacionService.listarBitacoraTrimestral({ modulo: 'CALIFICACIONES_TRIMESTRALES' }).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    this.bitacora.set(response.data ?? []);
                    return;
                }
                this.showWarn(response.mensaje || 'No se pudo cargar la bitácora');
            },
            error: () => this.showError('No se pudo cargar la bitácora'),
        });
    }

    onGestionChange(): void {
        this.autocompletarFiltros();
        this.cargarVista();
        this.cargarConsolidado();
    }

    onFiltroChange(): void {
        this.autocompletarFiltros();
        this.cargarVista();
    }

    private autocompletarFiltros(): void {
        if (!this.filtroGestion && this.gestiones().length) {
            this.filtroGestion = this.gestiones()[0].id;
        }
        if (!this.filtroCurso && this.cursos().length) {
            this.filtroCurso = this.cursos()[0].id;
        }
        if (!this.filtroParalelo && this.paralelosFiltrados.length) {
            this.filtroParalelo = this.paralelosFiltrados[0].id;
        }
        if (!this.filtroMateria && this.materias().length) {
            this.filtroMateria = this.materias()[0].id;
        }
        if (!this.filtroEstudiante && this.estudiantes().length) {
            this.filtroEstudiante = this.estudiantes()[0].id;
        }

        this.actividadForm = {
            ...this.actividadForm,
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idCurso: this.filtroCurso,
            idParalelo: this.filtroParalelo,
            idMateria: this.filtroMateria,
            idDocente: this.actividadForm.idDocente || this.docentes()[0]?.id || '',
        };
        this.serForm = {
            ...this.serForm,
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idCurso: this.filtroCurso,
            idParalelo: this.filtroParalelo,
            idMateria: this.filtroMateria,
            idDocente: this.serForm.idDocente || this.docentes()[0]?.id || '',
            idEstudiante: this.filtroEstudiante || this.serForm.idEstudiante,
        };
        this.autoevaluacionForm = {
            ...this.autoevaluacionForm,
            idGestionAcademica: this.filtroGestion,
            trimestre: this.filtroTrimestre,
            idMateria: this.filtroMateria,
            idEstudiante: this.filtroEstudiante || this.autoevaluacionForm.idEstudiante,
        };
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
            descripcion: '',
            estado: 'ACTIVA',
        };
    }

    private nuevoSerForm(): CalificacionSerRequest {
        return {
            idGestionAcademica: '',
            trimestre: 1,
            idCurso: '',
            idParalelo: '',
            idMateria: '',
            idDocente: '',
            idEstudiante: '',
            notaSer: 0,
            observacion: '',
        };
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
        this.messageService.add({ severity: 'warn', summary: 'Atención', detail });
    }

    showError(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
    }
}
