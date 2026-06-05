import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { SaasService } from '@/core/services/saas.service';
import { AuthService } from '@/core/services/auth.service';
import {
    ModuloSistemaResponse,
    PlanSuscripcionRequest,
    PlanSuscripcionResponse,
} from '@/core/models/sia.models';

@Component({
    selector: 'app-admin-planes',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule,
        ConfirmDialogModule, MultiSelectModule, InputNumberModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-planes.component.html',
})
export class AdminPlanesComponent implements OnInit {
    private service = inject(SaasService);
    private auth = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    get isSuperAdmin(): boolean { return this.auth.isSuperAdmin(); }

    planes = signal<PlanSuscripcionResponse[]>([]);
    modulos = signal<ModuloSistemaResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';

    form: PlanSuscripcionRequest = this.emptyForm();
    selectedModuloIds: string[] = [];

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void {
        this.load();
        this.loadModulos();
    }

    private emptyForm(): PlanSuscripcionRequest {
        return { codigo: '', nombre: '', descripcion: '', maxUsuarios: 10, maxAlmacenamientoMb: 1024, precioMensual: 0, idModulos: [] };
    }

    load(): void {
        this.loading = true;
        this.service.listarPlanes().subscribe({
            next: r => { this.loading = false; if (r.codigo === 200) this.planes.set(r.data ?? []); },
            error: () => { this.loading = false; this.error('No se pudieron cargar los planes'); }
        });
    }

    loadModulos(): void {
        this.service.listarModulos('ACTIVO').subscribe({
            next: r => { if (r.codigo === 200) this.modulos.set(r.data ?? []); }
        });
    }

    nuevo(): void {
        this.form = this.emptyForm();
        this.selectedModuloIds = [];
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(p: PlanSuscripcionResponse): void {
        this.form = {
            codigo: p.codigo,
            nombre: p.nombre,
            descripcion: p.descripcion ?? '',
            maxUsuarios: p.maxUsuarios,
            maxAlmacenamientoMb: p.maxAlmacenamientoMb,
            precioMensual: p.precioMensual,
            idModulos: p.modulos.map(m => m.id),
        };
        this.selectedModuloIds = p.modulos.map(m => m.id);
        this.selectedId = p.id;
        this.editMode = true;
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.codigo || !this.form.nombre) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Código y nombre son requeridos', life: 3000 });
            return;
        }
        this.form.idModulos = this.selectedModuloIds;
        const obs = this.editMode
            ? this.service.actualizarPlan(this.selectedId, this.form)
            : this.service.crearPlan(this.form);
        obs.subscribe({
            next: r => {
                if (r.codigo === 200 || r.codigo === 201) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.editMode ? 'Plan actualizado' : 'Plan creado', life: 3000 });
                    this.dialogVisible = false;
                    this.load();
                }
            },
            error: e => this.error(e.error?.mensaje ?? 'Error al guardar el plan')
        });
    }

    confirmarDesactivar(p: PlanSuscripcionResponse): void {
        this.confirmationService.confirm({
            message: `¿Desactivar el plan "${p.nombre}"?`,
            header: 'Confirmar desactivación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.service.desactivarPlan(p.id).subscribe({
                    next: () => { this.messageService.add({ severity: 'success', summary: 'Desactivado', detail: 'Plan desactivado correctamente', life: 3000 }); this.load(); },
                    error: e => this.error(e.error?.mensaje ?? 'Error al desactivar')
                });
            }
        });
    }

    severityEstado(estado: string): 'success' | 'danger' | 'warn' {
        return estado === 'ACTIVO' ? 'success' : 'danger';
    }

    private error(detail: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
    }
}
