import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SaasService } from '@/core/services/saas.service';
import { AuthService } from '@/core/services/auth.service';
import { InstitucionService } from '@/core/services/institucion.service';
import {
    InstitucionResponse,
    PlanSuscripcionResponse,
    SuscripcionInstitucionRequest,
    SuscripcionInstitucionResponse,
} from '@/core/models/sia.models';

interface SuscripcionRow {
    institucion: InstitucionResponse;
    suscripcion?: SuscripcionInstitucionResponse;
}

@Component({
    selector: 'app-admin-suscripciones',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        DialogModule, TooltipModule, ConfirmDialogModule, SelectModule, DatePickerModule, InputTextModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-suscripciones.component.html',
})
export class AdminSuscripcionesComponent implements OnInit {
    private saasService = inject(SaasService);
    private auth = inject(AuthService);
    private institucionService = inject(InstitucionService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    get isSuperAdmin(): boolean { return this.auth.isSuperAdmin(); }

    rows = signal<SuscripcionRow[]>([]);
    planes = signal<PlanSuscripcionResponse[]>([]);
    loading = true;
    dialogVisible = false;
    selectedInstitucion: InstitucionResponse | null = null;

    form: SuscripcionInstitucionRequest = { idPlan: '', fechaInicio: '', fechaFin: '', observacion: '' };
    fechaInicioDate: Date = new Date();
    fechaFinDate: Date | null = null;

    ngOnInit(): void {
        this.load();
        this.loadPlanes();
    }

    load(): void {
        this.loading = true;
        this.institucionService.listar().subscribe({
            next: r => {
                if (r.codigo === 200) {
                    const instituciones = r.data ?? [];
                    const rowsTemp: SuscripcionRow[] = instituciones.map(inst => ({ institucion: inst }));
                    // Cargar suscripción activa de cada institución
                    let pending = instituciones.length;
                    if (pending === 0) { this.rows.set([]); this.loading = false; return; }
                    instituciones.forEach((inst, idx) => {
                        this.saasService.obtenerSuscripcionActiva(inst.id).subscribe({
                            next: sr => {
                                if (sr.codigo === 200 && sr.data) rowsTemp[idx].suscripcion = sr.data;
                            },
                            complete: () => {
                                pending--;
                                if (pending === 0) { this.rows.set([...rowsTemp]); this.loading = false; }
                            },
                            error: () => {
                                pending--;
                                if (pending === 0) { this.rows.set([...rowsTemp]); this.loading = false; }
                            }
                        });
                    });
                } else {
                    this.loading = false;
                }
            },
            error: () => { this.loading = false; this.error('No se pudieron cargar las instituciones'); }
        });
    }

    loadPlanes(): void {
        this.saasService.listarPlanes('ACTIVO').subscribe({
            next: r => { if (r.codigo === 200) this.planes.set(r.data ?? []); }
        });
    }

    abrirDialog(row: SuscripcionRow): void {
        this.selectedInstitucion = row.institucion;
        this.fechaInicioDate = new Date();
        this.fechaFinDate = null;
        this.form = { idPlan: '', fechaInicio: '', observacion: '' };
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.idPlan) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un plan', life: 3000 });
            return;
        }
        this.form.fechaInicio = this.fechaInicioDate.toISOString().split('T')[0];
        if (this.fechaFinDate) this.form.fechaFin = this.fechaFinDate.toISOString().split('T')[0];
        this.saasService.suscribir(this.form, this.selectedInstitucion!.id).subscribe({
            next: r => {
                if (r.codigo === 200 || r.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'Suscrito', detail: 'Suscripción asignada correctamente', life: 3000 });
                    this.dialogVisible = false;
                    this.load();
                }
            },
            error: e => this.error(e.error?.mensaje ?? 'Error al asignar suscripción')
        });
    }

    confirmarCancelar(row: SuscripcionRow): void {
        this.confirmationService.confirm({
            message: `¿Cancelar la suscripción de "${row.institucion.nombre}"?`,
            header: 'Confirmar cancelación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.saasService.cancelarSuscripcion(row.institucion.id).subscribe({
                    next: () => { this.messageService.add({ severity: 'success', summary: 'Cancelado', detail: 'Suscripción cancelada', life: 3000 }); this.load(); },
                    error: e => this.error(e.error?.mensaje ?? 'Error al cancelar')
                });
            }
        });
    }

    severidadEstado(estado?: string): 'success' | 'danger' | 'warn' | 'secondary' {
        if (!estado) return 'secondary';
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary'> = {
            ACTIVA: 'success', VENCIDA: 'danger', CANCELADA: 'danger', SUSPENDIDA: 'warn'
        };
        return map[estado] ?? 'secondary';
    }

    private error(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
    }
}
