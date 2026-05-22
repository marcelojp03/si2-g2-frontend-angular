import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AsistenciaService } from '@/core/services/asistencia.service';
import { AuthService } from '@/core/services/auth.service';
import {
    AsistenciaAsignacionResponse,
    AsistenciaDetalleRequest,
    AsistenciaEstudianteResponse,
    AsistenciaPlantillaResponse,
    AsistenciaRegistroRequest,
    EstadoAsistencia,
} from '@/core/models/sia.models';

@Component({
    selector: 'app-asistencia',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        TagModule,
        ToastModule,
        TooltipModule,
    ],
    providers: [MessageService],
    templateUrl: './asistencia.component.html',
})
export class AsistenciaComponent implements OnInit {
    private asistenciaService = inject(AsistenciaService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    asignaciones = signal<AsistenciaAsignacionResponse[]>([]);
    plantilla = signal<AsistenciaPlantillaResponse | null>(null);

    loadingAsignaciones = false;
    loadingPlantilla = false;
    guardando = false;

    idAsignacionDocente = '';
    fecha = this.hoyLocal();

    readonly estadosOptions: { label: string; value: EstadoAsistencia; severity: string }[] = [
        { label: 'Presente', value: 'PRESENTE', severity: 'success' },
        { label: 'Ausente', value: 'AUSENTE', severity: 'danger' },
        { label: 'Tardanza', value: 'TARDANZA', severity: 'warn' },
        { label: 'Justificado', value: 'JUSTIFICADO', severity: 'info' },
    ];

    readonly asignacionesOptions = computed(() =>
        this.asignaciones().map((a) => ({
            label: this.asignacionLabel(a),
            value: a.idAsignacionDocente,
        }))
    );

    readonly totalPresentes = computed(() => this.contarEstado('PRESENTE'));
    readonly totalAusentes = computed(() => this.contarEstado('AUSENTE'));
    readonly totalTardanzas = computed(() => this.contarEstado('TARDANZA'));
    readonly totalJustificados = computed(() => this.contarEstado('JUSTIFICADO'));

    ngOnInit(): void {
        this.cargarAsignaciones();
    }

    cargarAsignaciones(): void {
        this.loadingAsignaciones = true;

        this.asistenciaService.listarMisAsignaciones().subscribe({
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
                    this.cargarPlantilla();
                }
            },
            error: (e) => {
                this.loadingAsignaciones = false;
                this.showError(e, 'No se pudieron cargar las asignaciones del docente');
            },
        });
    }

    cargarPlantilla(): void {
        if (!this.idAsignacionDocente) {
            this.showWarn('Selecciona una materia/grupo');
            return;
        }

        if (!this.fecha) {
            this.showWarn('Selecciona una fecha');
            return;
        }

        this.loadingPlantilla = true;

        this.asistenciaService.obtenerPlantilla(this.idAsignacionDocente, this.fecha).subscribe({
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
                this.showError(e, 'No se pudo cargar la plantilla de asistencia');
            },
        });
    }

    guardar(): void {
        const plantilla = this.plantilla();

        if (!plantilla) {
            this.showWarn('Primero carga una plantilla de asistencia');
            return;
        }

        if (!this.puedeEditar()) {
            this.showWarn('No tienes permiso para guardar esta asistencia');
            return;
        }

        const detalles: AsistenciaDetalleRequest[] = plantilla.estudiantes.map((estudiante) => ({
            idInscripcion: estudiante.idInscripcion,
            estadoAsistencia: estudiante.estadoAsistencia,
        }));

        const body: AsistenciaRegistroRequest = {
            idAsignacionDocente: plantilla.idAsignacionDocente,
            fecha: plantilla.fecha,
            detalles,
        };

        this.guardando = true;

        this.asistenciaService.guardarAsistencia(body).subscribe({
            next: (response) => {
                this.guardando = false;

                if (response.codigo !== 201 && response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo guardar la asistencia');
                    return;
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Asistencia guardada',
                    detail: 'El registro de asistencia fue guardado correctamente',
                    life: 3000,
                });

                this.cargarPlantilla();
            },
            error: (e) => {
                this.guardando = false;
                this.showError(e, 'No se pudo guardar la asistencia');
            },
        });
    }

    marcarTodos(estado: EstadoAsistencia): void {
        const plantilla = this.plantilla();

        if (!plantilla) {
            this.showWarn('Primero carga una plantilla de asistencia');
            return;
        }

        if (!this.puedeEditar()) {
            this.showWarn('No tienes permiso para modificar esta asistencia');
            return;
        }

        const actualizada: AsistenciaPlantillaResponse = {
            ...plantilla,
            estudiantes: plantilla.estudiantes.map((e) => ({
                ...e,
                estadoAsistencia: estado,
            })),
        };

        this.plantilla.set(actualizada);
    }

    cambiarEstado(estudiante: AsistenciaEstudianteResponse, estado: EstadoAsistencia): void {
        const plantilla = this.plantilla();
        if (!plantilla) return;

        const actualizada: AsistenciaPlantillaResponse = {
            ...plantilla,
            estudiantes: plantilla.estudiantes.map((e) =>
                e.idInscripcion === estudiante.idInscripcion
                    ? { ...e, estadoAsistencia: estado }
                    : e
            ),
        };

        this.plantilla.set(actualizada);
    }

    puedeEditar(): boolean {
        if (this.fechaEsPasada() && !this.puedeEditarFechaPasada()) {
            return false;
        }

        return this.authService.hasRole('DOCENTE')
            || this.authService.hasRole('ADMIN_INSTITUCION')
            || this.authService.hasRole('SUPER_ADMIN')
            || this.authService.hasPermission('ASISTENCIA_WRITE');
    }

    puedeEditarFechaPasada(): boolean {
        return this.authService.hasRole('ADMIN_INSTITUCION')
            || this.authService.hasRole('SUPER_ADMIN')
            || this.authService.hasPermission('ASISTENCIA_BACKDATE');
    }

    fechaEsPasada(): boolean {
        return !!this.fecha && this.fecha < this.hoyLocal();
    }

    asignacionSeleccionada(): AsistenciaAsignacionResponse | null {
        return this.asignaciones().find((a) => a.idAsignacionDocente === this.idAsignacionDocente) ?? null;
    }

    asignacionLabel(asignacion: AsistenciaAsignacionResponse): string {
        return `${asignacion.nombreMateria} - ${asignacion.nombreCurso} ${asignacion.nombreParalelo}`;
    }

    estadoSeverity(estado: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
        switch (estado) {
            case 'PRESENTE':
            case 'REGISTRADA':
                return 'success';
            case 'AUSENTE':
            case 'ANULADA':
                return 'danger';
            case 'TARDANZA':
            case 'MODIFICADA':
                return 'warn';
            case 'JUSTIFICADO':
                return 'info';
            default:
                return 'secondary';
        }
    }

    estadoLabel(estado: string): string {
        switch (estado) {
            case 'PRESENTE':
                return 'Presente';
            case 'AUSENTE':
                return 'Ausente';
            case 'TARDANZA':
                return 'Tardanza';
            case 'JUSTIFICADO':
                return 'Justificado';
            case 'REGISTRADA':
                return 'Registrada';
            case 'MODIFICADA':
                return 'Modificada';
            case 'ANULADA':
                return 'Anulada';
            case 'NO_REGISTRADA':
                return 'No registrada';
            default:
                return estado;
        }
    }

    private contarEstado(estado: EstadoAsistencia): number {
        return this.plantilla()?.estudiantes?.filter((e) => e.estadoAsistencia === estado).length ?? 0;
    }

    private hoyLocal(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private showWarn(detail: string): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Atención',
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