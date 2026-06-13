import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { PlanPagoService } from '@/features/sia/planes-pago/services/plan-pago.service';
import { PlanPagoRequest, PlanPagoResponse } from '@/features/sia/planes-pago/models/plan-pago.models';

@Component({
    selector: 'app-planes-pago',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputNumberModule, TextareaModule, DialogModule,
        TooltipModule, ConfirmDialogModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './planes-pago.component.html'
})
export class PlanesPagoComponent implements OnInit {
    private service = inject(PlanPagoService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    planes = signal<PlanPagoResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';

    readonly tipoPeriodoOptions = [
        { label: 'Mensual', value: 'MENSUAL' },
        { label: 'Trimestral', value: 'TRIMESTRAL' },
        { label: 'Semestral', value: 'SEMESTRAL' },
        { label: 'Anual', value: 'ANUAL' },
    ];

    form: PlanPagoRequest = this.emptyForm();

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.service.listar(false).subscribe({
            next: (r) => { this.loading = false; if (r.codigo === 200) this.planes.set(r.data ?? []); },
            error: () => { this.loading = false; this.error('No se pudieron cargar los planes'); }
        });
    }

    nuevo(): void {
        this.form = this.emptyForm();
        this.selectedId = '';
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(p: PlanPagoResponse): void {
        this.form = {
            nombre: p.nombre, tipoPeriodo: p.tipoPeriodo, monto: p.monto,
            moneda: p.moneda, cantidadCuotas: p.cantidadCuotas,
            diaVencimiento: p.diaVencimiento, descripcion: p.descripcion
        };
        this.selectedId = p.id;
        this.editMode = true;
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.nombre?.trim() || !this.form.monto || !this.form.cantidadCuotas) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Nombre, monto y cantidad de cuotas son requeridos', life: 3000 });
            return;
        }
        const body: PlanPagoRequest = {
            ...this.form, nombre: this.form.nombre.trim(),
            tipoPeriodo: this.form.tipoPeriodo || 'MENSUAL'
        };
        const obs = this.editMode
            ? this.service.actualizar(this.selectedId, body)
            : this.service.crear(body);
        obs.subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: this.editMode ? 'Plan actualizado' : 'Plan creado', life: 3000 });
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al guardar')
        });
    }

    confirmarDesactivar(p: PlanPagoResponse): void {
        this.confirmationService.confirm({
            message: `Desactivar el plan "${p.nombre}"?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.service.desactivar(p.id).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Desactivado', detail: 'Plan desactivado', life: 3000 }); this.load(); },
                error: (e) => this.error(e.error?.mensaje ?? 'Error')
            })
        });
    }

    tipoLabel(t: string): string { return this.tipoPeriodoOptions.find(o => o.value === t)?.label ?? t; }

    estadoSeveridad(activo: boolean): string { return activo ? 'success' : 'danger'; }

    private emptyForm(): PlanPagoRequest {
        return { nombre: '', tipoPeriodo: 'MENSUAL', monto: null, cantidadCuotas: null, diaVencimiento: 10, moneda: 'BOB' };
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
