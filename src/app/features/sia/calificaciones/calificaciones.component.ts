import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/core/services/auth.service';
import { CalificacionService } from '@/core/services/calificacion.service';
import {
    CalificacionAsignacionResponse,
    CalificacionDetalleRequest,
    CalificacionEstudianteResponse,
    CalificacionPlantillaResponse,
    CalificacionResumenResponse,
    EscalaEvaluacion,
    EstadoEvaluacion,
    EvaluacionRequest,
    EvaluacionResponse,
} from '@/core/models/sia.models';

@Component({
    selector: 'app-calificaciones',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TagModule,
        ToastModule,
        TooltipModule,
        DialogModule,
        TextareaModule,
    ],
    providers: [MessageService],
    templateUrl: './calificaciones.component.html',
})
export class CalificacionesComponent implements OnInit {
    private calificacionService = inject(CalificacionService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    asignaciones = signal<CalificacionAsignacionResponse[]>([]);
    evaluaciones = signal<EvaluacionResponse[]>([]);
    plantilla = signal<CalificacionPlantillaResponse | null>(null);
    resumen = signal<CalificacionResumenResponse | null>(null);

    loadingAsignaciones = false;
    loadingEvaluaciones = false;
    loadingPlantilla = false;
    guardandoNotas = false;
    guardandoEvaluacion = false;
    dialogEvaluacion = false;

    idAsignacionDocente = '';
    idEvaluacion = '';
    periodo = 1;
    razonesCambio: Record<string, string> = {};

    formEvaluacion: EvaluacionRequest = this.nuevaEvaluacionForm();

    readonly tiposEvaluacion = [
        { label: 'Parcial', value: 'PARCIAL' },
        { label: 'Examen', value: 'EXAMEN' },
        { label: 'Trabajo practico', value: 'TRABAJO_PRACTICO' },
        { label: 'Proyecto', value: 'PROYECTO' },
        { label: 'Participacion', value: 'PARTICIPACION' },
    ];

    readonly escalas = [
        { label: 'Numerica', value: 'NUMERICA' as EscalaEvaluacion },
        { label: 'Literal', value: 'LITERAL' as EscalaEvaluacion },
    ];

    readonly estadosEvaluacion = [
        { label: 'Abierta', value: 'ABIERTA' as EstadoEvaluacion },
        { label: 'Cerrada', value: 'CERRADA' as EstadoEvaluacion },
        { label: 'Anulada', value: 'ANULADA' as EstadoEvaluacion },
    ];

    readonly notasLiterales = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' },
        { label: 'F', value: 'F' },
    ];

    readonly periodosOptions = computed(() =>
        Array.from({ length: 6 }, (_, index) => ({
            label: `Periodo ${index + 1}`,
            value: index + 1,
        }))
    );

    readonly asignacionesOptions = computed(() =>
        this.asignaciones().map((a) => ({
            label: this.asignacionLabel(a),
            value: a.idAsignacionDocente,
        }))
    );

    readonly evaluacionesOptions = computed(() =>
        this.evaluaciones().map((e) => ({
            label: `${e.nombre} (${e.ponderacion}%)`,
            value: e.id,
        }))
    );

    readonly ponderacionTotal = computed(() =>
        this.evaluaciones()
            .filter((e) => e.estado !== 'ANULADA')
            .reduce((total, evaluacion) => total + Number(evaluacion.ponderacion || 0), 0)
    );

    ngOnInit(): void {
        this.cargarAsignaciones();
    }

    cargarAsignaciones(): void {
        this.loadingAsignaciones = true;
        this.calificacionService.listarMisAsignaciones().subscribe({
            next: (response) => {
                this.loadingAsignaciones = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron cargar las asignaciones');
                    return;
                }
                const data = response.data ?? [];
                this.asignaciones.set(data);
                if (data.length > 0 && !this.idAsignacionDocente) {
                    this.idAsignacionDocente = data[0].idAsignacionDocente;
                    this.cargarEvaluaciones();
                }
            },
            error: (e) => {
                this.loadingAsignaciones = false;
                this.showError(e, 'No se pudieron cargar las asignaciones');
            },
        });
    }

    cargarEvaluaciones(): void {
        if (!this.idAsignacionDocente) {
            this.showWarn('Selecciona una materia/grupo');
            return;
        }

        this.loadingEvaluaciones = true;
        this.idEvaluacion = '';
        this.plantilla.set(null);
        this.resumen.set(null);

        this.calificacionService.listarEvaluaciones(this.idAsignacionDocente, this.periodo).subscribe({
            next: (response) => {
                this.loadingEvaluaciones = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron cargar las evaluaciones');
                    return;
                }
                const data = response.data ?? [];
                this.evaluaciones.set(data);
                if (data.length > 0) {
                    this.idEvaluacion = data[0].id;
                    this.cargarPlantilla();
                }
                this.cargarResumen();
            },
            error: (e) => {
                this.loadingEvaluaciones = false;
                this.showError(e, 'No se pudieron cargar las evaluaciones');
            },
        });
    }

    cargarPlantilla(): void {
        if (!this.idEvaluacion) {
            this.showWarn('Selecciona una evaluacion');
            return;
        }

        this.loadingPlantilla = true;
        this.razonesCambio = {};

        this.calificacionService.obtenerPlantilla(this.idEvaluacion).subscribe({
            next: (response) => {
                this.loadingPlantilla = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo cargar la plantilla');
                    return;
                }
                this.plantilla.set(response.data);
            },
            error: (e) => {
                this.loadingPlantilla = false;
                this.plantilla.set(null);
                this.showError(e, 'No se pudo cargar la plantilla de calificaciones');
            },
        });
    }

    abrirNuevaEvaluacion(): void {
        if (!this.idAsignacionDocente) {
            this.showWarn('Selecciona una materia/grupo');
            return;
        }
        this.formEvaluacion = this.nuevaEvaluacionForm();
        this.dialogEvaluacion = true;
    }

    guardarEvaluacion(): void {
        if (!this.formEvaluacion.nombre || !this.formEvaluacion.tipo || !this.formEvaluacion.ponderacion) {
            this.showWarn('Completa nombre, tipo y ponderacion');
            return;
        }

        this.guardandoEvaluacion = true;
        this.calificacionService.crearEvaluacion(this.formEvaluacion).subscribe({
            next: (response) => {
                this.guardandoEvaluacion = false;
                if (response.codigo !== 201 && response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo guardar la evaluacion');
                    return;
                }
                this.dialogEvaluacion = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Evaluacion creada',
                    detail: 'La evaluacion fue registrada correctamente',
                    life: 3000,
                });
                this.cargarEvaluaciones();
            },
            error: (e) => {
                this.guardandoEvaluacion = false;
                this.showError(e, 'No se pudo guardar la evaluacion');
            },
        });
    }

    guardarNotas(): void {
        const plantilla = this.plantilla();
        if (!plantilla) {
            this.showWarn('Primero carga una evaluacion');
            return;
        }
        if (!this.puedeEditarNotas()) {
            this.showWarn('No tienes permiso para editar esta evaluacion');
            return;
        }

        const detalles: CalificacionDetalleRequest[] = plantilla.estudiantes
            .filter((estudiante) => this.tieneNota(estudiante))
            .map((estudiante) => ({
                idInscripcion: estudiante.idInscripcion,
                notaNumerica: plantilla.evaluacion.escala === 'NUMERICA' ? estudiante.notaNumerica ?? null : null,
                notaLiteral: plantilla.evaluacion.escala === 'LITERAL' ? estudiante.notaLiteral ?? null : null,
                razonCambio: this.razonesCambio[estudiante.idInscripcion] || null,
            }));

        if (detalles.length === 0) {
            this.showWarn('Registra al menos una calificacion');
            return;
        }

        this.guardandoNotas = true;
        this.calificacionService.guardarCalificaciones({
            idEvaluacion: plantilla.idEvaluacion,
            detalles,
        }).subscribe({
            next: (response) => {
                this.guardandoNotas = false;
                if (response.codigo !== 201 && response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron guardar las calificaciones');
                    return;
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Calificaciones guardadas',
                    detail: 'Las notas fueron registradas correctamente',
                    life: 3000,
                });
                this.plantilla.set(response.data);
                this.razonesCambio = {};
                this.cargarResumen();
            },
            error: (e) => {
                this.guardandoNotas = false;
                this.showError(e, 'No se pudieron guardar las calificaciones');
            },
        });
    }

    cargarResumen(): void {
        if (!this.idAsignacionDocente || !this.periodo) return;
        this.calificacionService.obtenerResumen(this.idAsignacionDocente, this.periodo).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    this.resumen.set(response.data);
                }
            },
        });
    }

    cambiarNotaNumerica(estudiante: CalificacionEstudianteResponse, nota: number | null): void {
        this.actualizarEstudiante(estudiante.idInscripcion, {
            notaNumerica: nota,
            notaLiteral: null,
        });
    }

    cambiarNotaLiteral(estudiante: CalificacionEstudianteResponse, nota: string | null): void {
        this.actualizarEstudiante(estudiante.idInscripcion, {
            notaNumerica: null,
            notaLiteral: nota,
        });
    }

    puedeEditarNotas(): boolean {
        const plantilla = this.plantilla();
        if (!plantilla) return false;
        return plantilla.puedeEditar && (
            this.authService.hasRole('DOCENTE')
            || this.authService.hasRole('ADMIN_INSTITUCION')
            || this.authService.hasRole('SUPER_ADMIN')
            || this.authService.hasPermission('CALIFICACIONES_WRITE')
        );
    }

    asignacionLabel(asignacion: CalificacionAsignacionResponse): string {
        return `${asignacion.nombreMateria} - ${asignacion.nombreCurso} ${asignacion.nombreParalelo}`;
    }

    estadoSeverity(estado: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
        switch (estado) {
            case 'ABIERTA':
            case 'APROBADO':
                return 'success';
            case 'CERRADA':
            case 'EN_RIESGO':
                return 'warn';
            case 'ANULADA':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    private nuevaEvaluacionForm(): EvaluacionRequest {
        return {
            idAsignacionDocente: this.idAsignacionDocente,
            periodo: this.periodo,
            tipo: 'PARCIAL',
            nombre: '',
            ponderacion: 10,
            escala: 'NUMERICA',
            estado: 'ABIERTA',
        };
    }

    private tieneNota(estudiante: CalificacionEstudianteResponse): boolean {
        const plantilla = this.plantilla();
        if (!plantilla) return false;
        if (plantilla.evaluacion.escala === 'NUMERICA') {
            return estudiante.notaNumerica !== null && estudiante.notaNumerica !== undefined;
        }
        return !!estudiante.notaLiteral;
    }

    private actualizarEstudiante(idInscripcion: string, patch: Partial<CalificacionEstudianteResponse>): void {
        const plantilla = this.plantilla();
        if (!plantilla) return;
        this.plantilla.set({
            ...plantilla,
            estudiantes: plantilla.estudiantes.map((estudiante) =>
                estudiante.idInscripcion === idInscripcion
                    ? { ...estudiante, ...patch }
                    : estudiante
            ),
        });
    }

    private showWarn(detail: string): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Atencion',
            detail,
            life: 3500,
        });
    }

    private showError(error: any, fallback: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.mensaje ?? error?.message ?? fallback,
            life: 4500,
        });
    }
}
