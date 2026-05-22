import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/core/services/auth.service';
import { HorarioService } from '@/core/services/horario.service';
import { SiaService } from '@/core/services/sia.service';
import { HorarioClaseResponse, HorarioClaseRequest, AsignacionDocenteResponse, AulaResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-gestion-horarios',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        TagModule,
        InputTextModule,
        InputIconModule,
        IconFieldModule,
        DialogModule,
        TooltipModule,
        ConfirmDialogModule,
        SelectModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './gestion-horarios.component.html'
})
export class GestionHorariosComponent implements OnInit {
    private horarioService = inject(HorarioService);
    private siaService = inject(SiaService);
    private auth = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    horarios = signal<HorarioClaseResponse[]>([]);
    asignaciones = signal<AsignacionDocenteResponse[]>([]);
    aulas = signal<AulaResponse[]>([]);

    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';

    readonly diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    readonly estadoOptions = [
        { label: 'Todos', value: '' },
        { label: 'Activo', value: 'ACTIVO' },
        { label: 'Inactivo', value: 'INACTIVO' }
    ];

    filtros = {
        dia: '',
        aula: '',
        asignacion: ''
    };

    form: HorarioClaseRequest = this.emptyForm();

    @ViewChild('dt') dt!: Table;

    get currentUser() {
        return this.auth.currentUserSignal();
    }

    get idInstitucion(): string {
        return this.currentUser?.idInstitucion || '';
    }

    get canWrite(): boolean {
        return this.auth.hasPermission('GESTION_WRITE') ||
            this.auth.hasRole('ADMIN_INSTITUCION') ||
            this.auth.hasRole('DIRECTOR') ||
            this.auth.hasRole('SUPER_ADMIN');
    }

    get horariosFiltered(): HorarioClaseResponse[] {
        return this.horarios().filter(h => {
            if (this.filtros.dia && h.diaSemana !== this.filtros.dia) return false;
            if (this.filtros.aula && h.idAula !== this.filtros.aula) return false;
            if (this.filtros.asignacion && h.idAsignacionDocente !== this.filtros.asignacion) return false;
            return true;
        });
    }

    get aulasOptions() {
        return this.aulas().map(a => ({ label: `${a.codigo} - ${a.nombre}`, value: a.id }));
    }

    get asignacionesOptions() {
        return this.asignaciones().map(a => {
            const aula = this.aulas().find(au => au.id === this.form.idAula);
            return {
                label: `Asignación #${a.id.substring(0, 8)}`,
                value: a.id
            };
        });
    }

    ngOnInit(): void {
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.loading = true;
        if (!this.idInstitucion) {
            this.error('No se encontró la institución del usuario');
            this.loading = false;
            return;
        }

        // Cargar en paralelo
        Promise.all([
            this.horarioService.listarPorInstitucion(this.idInstitucion).toPromise(),
            this.siaService.listarAsignaciones().toPromise(),
            this.siaService.listarAulas().toPromise()
        ]).then(([horariosResp, asignacionesResp, aulasResp]) => {
            this.loading = false;

            if (horariosResp?.codigo === 200) {
                this.horarios.set(horariosResp.data ?? []);
            } else {
                this.error('No se pudieron cargar los horarios');
            }

            if (asignacionesResp?.codigo === 200) {
                this.asignaciones.set(asignacionesResp.data ?? []);
            }

            if (aulasResp?.codigo === 200) {
                this.aulas.set(aulasResp.data ?? []);
            }
        }).catch(() => {
            this.loading = false;
            this.error('No se pudieron cargar los datos');
        });
    }

    nuevo(): void {
        this.form = this.emptyForm();
        this.selectedId = '';
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(horario: HorarioClaseResponse): void {
        this.form = {
            idInstitucion: horario.idInstitucion,
            idAsignacionDocente: horario.idAsignacionDocente,
            idAula: horario.idAula,
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin
        };
        this.selectedId = horario.id;
        this.editMode = true;
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.validarFormulario()) {
            return;
        }

        const body: HorarioClaseRequest = {
            idInstitucion: this.idInstitucion,
            idAsignacionDocente: this.form.idAsignacionDocente,
            idAula: this.form.idAula,
            diaSemana: this.form.diaSemana,
            horaInicio: this.form.horaInicio,
            horaFin: this.form.horaFin
        };

        const obs = this.editMode
            ? this.horarioService.actualizar(this.selectedId, body)
            : this.horarioService.crear(body);

        obs.subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: this.editMode ? 'Horario actualizado' : 'Horario creado',
                    life: 3000
                });
                this.cargarDatos();
            },
            error: (err) => {
                this.handleError(err);
            }
        });
    }

    eliminar(horario: HorarioClaseResponse): void {
        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas eliminar este horario?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.horarioService.eliminar(horario.id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Horario eliminado',
                            life: 3000
                        });
                        this.cargarDatos();
                    },
                    error: (err) => {
                        this.handleError(err);
                    }
                });
            }
        });
    }

    limpiarFiltros(): void {
        this.filtros = { dia: '', aula: '', asignacion: '' };
    }

    private validarFormulario(): boolean {
        if (!this.form.diaSemana?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'El día de la semana es requerido',
                life: 3000
            });
            return false;
        }

        if (!this.form.horaInicio?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'La hora de inicio es requerida',
                life: 3000
            });
            return false;
        }

        if (!this.form.horaFin?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'La hora de fin es requerida',
                life: 3000
            });
            return false;
        }

        if (!this.form.idAula?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'El aula es requerida',
                life: 3000
            });
            return false;
        }

        if (!this.form.idAsignacionDocente?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atención',
                detail: 'La asignación docente es requerida',
                life: 3000
            });
            return false;
        }

        return true;
    }

    private handleError(err: any): void {
        const status = err?.status;
        if (status === 409) {
            this.error('Existe un conflicto de horario. Revisa aula, docente o grupo.');
        } else if (status === 403) {
            this.error('No tienes permisos para gestionar horarios.');
        } else if (status === 500) {
            this.error('Ocurrió un error interno al gestionar el horario.');
        } else {
            this.error('Ocurrió un error al procesar la solicitud');
        }
    }

    private error(msg: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: msg,
            life: 5000
        });
    }

    private emptyForm(): HorarioClaseRequest {
        return {
            idInstitucion: this.idInstitucion,
            idAsignacionDocente: '',
            idAula: '',
            diaSemana: '',
            horaInicio: '',
            horaFin: ''
        };
    }

    getAulaLabel(idAula: string): string {
        const aula = this.aulas().find(a => a.id === idAula);
        return aula ? `${aula.codigo} - ${aula.nombre}` : idAula;
    }

    getAsignacionLabel(idAsignacion: string): string {
        return `Asignación #${idAsignacion.substring(0, 8)}`;
    }
}
