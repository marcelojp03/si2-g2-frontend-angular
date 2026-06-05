import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { CanPermDirective } from '@/shared/directives/can-perm.directive';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';
import { GestionAcademicaResponse } from '@/core/models/sia.models';
import { PeriodoEvaluacionRequest, PeriodoEvaluacionResponse } from '@/features/sia/calificaciones/models/calificaciones.models';
import { CalificacionService } from '@/features/sia/calificaciones/services/calificacion.service';
import { DimensionService } from './dimension.service';
import { DimensionResponse, PeriodoDimensionResponse } from './dimension.models';

interface PeriodoForm {
    numeroPeriodo: number;
    tipoPeriodo: string;
    fechaInicio: string;
    fechaFin: string;
    pesos: { idDimension: string; nombre: string; ponderacion: number }[];
}

@Component({
    selector: 'app-gestion-periodos',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, DialogModule, SelectModule, InputNumberModule,
        ConfirmDialogModule, CardModule, CanPermDirective],
    providers: [MessageService, ConfirmationService],
    template: `
<p-toast />
<p-confirmDialog />

<div class="card">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 m-0">Per&iacute;odos de Evaluaci&oacute;n</h3>
            <p class="text-surface-400 text-sm mt-1 mb-0">Configura fechas y ponderaciones de cada per&iacute;odo</p>
        </div>
    </div>

    <!-- Gestion Selector -->
    <div class="mb-6 flex items-center gap-4">
        <div class="flex flex-col gap-1 flex-1 max-w-md">
            <label class="font-medium text-sm">Gesti&oacute;n</label>
            <p-select [options]="gestiones()" [(ngModel)]="idGestionSel" optionLabel="nombre" optionValue="id"
                placeholder="Seleccione una gesti&oacute;n" appendTo="body" styleClass="w-full"
                (ngModelChange)="onGestionChange()" />
        </div>
    </div>

    @if (idGestionSel) {
    <!-- Periods Table -->
    <p-card styleClass="mb-4">
        <ng-template #header>
            <div class="flex items-center justify-between px-4 py-2">
                <span class="font-semibold">Per&iacute;odos</span>
                <ng-container *appCanPerm="['GESTIONES_UPDATE']">
                    <p-button label="Nuevo per&iacute;odo" icon="pi pi-plus" size="small" (onClick)="nuevoPeriodo()" />
                </ng-container>
            </div>
        </ng-template>

        <p-table [value]="periodos()" [loading]="loading" dataKey="id" styleClass="p-datatable-striped">
            <ng-template #header>
                <tr>
                    <th>N&deg;</th>
                    <th>Tipo</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Dimensiones</th>
                    <th>Estado</th>
                    <th class="w-40">Acciones</th>
                </tr>
            </ng-template>
            <ng-template #body let-p>
                <tr>
                    <td class="font-medium">{{ p.numeroPeriodo }}</td>
                    <td>{{ p.tipoPeriodo }}</td>
                    <td>{{ p.fechaInicio | date:'dd/MM/yyyy' }}</td>
                    <td>{{ p.fechaFin | date:'dd/MM/yyyy' }}</td>
                    <td>
                        @if (pesosPorPeriodo()[p.id]) {
                        <div class="flex flex-wrap gap-1">
                            @for (pd of pesosPorPeriodo()[p.id]; track pd.idDimension) {
                            <p-tag [value]="pd.nombreDimension + ': ' + pd.ponderacion + '%'" severity="info" />
                            }
                        </div>
                        } @else {
                        <span class="text-surface-400 text-sm">SER:{{ p.pesoSer }}% SABER:{{ p.pesoSaber }}% HACER:{{ p.pesoHacer }}% AUTO:{{ p.pesoAuto }}%</span>
                        }
                </td>
                <td>
                    <p-tag [value]="p.estado"
                        [severity]="p.estado === 'ABIERTO' ? 'success' : p.estado === 'CERRADO' ? 'danger' : 'warn'" />
                </td>
                <td>
                    <ng-container *appCanPerm="['GESTIONES_UPDATE']">
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="info"
                                pTooltip="Editar per&iacute;odo" tooltipPosition="top" (onClick)="editarPeriodo(p)" />
                            <p-button icon="pi pi-sliders-h" [rounded]="true" [text]="true" severity="warn"
                                pTooltip="Configurar dimensiones" tooltipPosition="top" (onClick)="editarDimensiones(p)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"
                                pTooltip="Eliminar" tooltipPosition="top" (onClick)="confirmarEliminar(p)" />
                        </div>
                    </ng-container>
                </td>
            </tr>
        </ng-template>
        <ng-template #emptymessage>
            <tr><td colspan="7" class="text-center py-6 text-surface-400">No hay per&iacute;odos. Cree el primero.</td></tr>
        </ng-template>
    </p-table>
</p-card>

<!-- Period Dialog -->
<p-dialog [(visible)]="dialogPeriodoVisible"
    [header]="editMode ? 'Editar Per&iacute;odo' : 'Nuevo Per&iacute;odo'"
    [modal]="true" [style]="{width: '520px'}" [draggable]="false">

    <div class="flex flex-col gap-4 pt-2">
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
                <label class="font-medium text-sm">N&uacute;mero <span class="text-red-500">*</span></label>
                <p-inputnumber [(ngModel)]="periodoForm.numeroPeriodo" [min]="1" [max]="12" [showButtons]="true"
                    inputStyleClass="w-full" styleClass="w-full" />
            </div>
            <div class="flex flex-col gap-1">
                <label class="font-medium text-sm">Tipo <span class="text-red-500">*</span></label>
                <p-select [options]="tipoOptions" [(ngModel)]="periodoForm.tipoPeriodo"
                    optionLabel="label" optionValue="value" placeholder="Seleccionar" appendTo="body" styleClass="w-full" />
            </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
                <label class="font-medium text-sm">Fecha inicio <span class="text-red-500">*</span></label>
                <input pInputText type="date" [(ngModel)]="periodoForm.fechaInicio" />
            </div>
            <div class="flex flex-col gap-1">
                <label class="font-medium text-sm">Fecha fin <span class="text-red-500">*</span></label>
                <input pInputText type="date" [(ngModel)]="periodoForm.fechaFin" />
            </div>
        </div>
    </div>

    <ng-template #footer>
        <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="dialogPeriodoVisible = false" />
        <p-button [label]="editMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" (onClick)="guardarPeriodo()" />
    </ng-template>
</p-dialog>

<!-- Dimensiones Dialog -->
<p-dialog [(visible)]="dialogDimensionesVisible"
    header="Configurar Dimensiones del Per&iacute;odo"
    [modal]="true" [style]="{width: '640px'}" [draggable]="false">

    <div class="flex flex-col gap-4 pt-2">
        <div class="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100">
            Seleccione las dimensiones a evaluar y su ponderaci&oacute;n. Las ponderaciones deben sumar 100%.
        </div>

        <p-table [value]="periodoForm.pesos" dataKey="idDimension" styleClass="p-datatable-sm">
            <ng-template #header>
                <tr>
                    <th>Dimensi&oacute;n</th>
                    <th class="w-40">Ponderaci&oacute;n (%)</th>
                    <th class="w-16"></th>
                </tr>
            </ng-template>
            <ng-template #body let-peso let-i="rowIndex">
                <tr>
                    <td>
                        <p-select [options]="dimensionesDisponibles()" [(ngModel)]="peso.idDimension"
                            optionLabel="label" optionValue="value" placeholder="Seleccionar dimensi&oacute;n"
                            appendTo="body" styleClass="w-full" />
                    </td>
                    <td>
                        <p-inputnumber [(ngModel)]="peso.ponderacion" [min]="0" [max]="100"
                            [showButtons]="true" inputStyleClass="w-full" styleClass="w-full" />
                    </td>
                    <td>
                        <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"
                            (onClick)="quitarDimension(i)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <div class="flex items-center justify-between">
            <p-button label="Agregar dimensi&oacute;n" icon="pi pi-plus" size="small" severity="secondary"
                [outlined]="true" (onClick)="agregarDimension()" />
            <div class="text-sm" [class.text-red-500]="sumaPonderaciones() !== 100"
                [class.text-green-600]="sumaPonderaciones() === 100">
                Total: <span class="font-bold">{{ sumaPonderaciones() }}%</span>
                @if (sumaPonderaciones() !== 100) {
                <span class="ml-2">(debe ser 100%)</span>
                }
            </div>
        </div>
    </div>

    <ng-template #footer>
        <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary"
            (onClick)="dialogDimensionesVisible = false" />
        <p-button label="Guardar dimensiones" icon="pi pi-check"
            [disabled]="sumaPonderaciones() !== 100" (onClick)="guardarDimensiones()" />
    </ng-template>
</p-dialog>
}
`
})
export class GestionPeriodosComponent implements OnInit {
    private gestionesSvc = inject(GestionesService);
    private calSvc = inject(CalificacionService);
    private dimSvc = inject(DimensionService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    gestiones = signal<GestionAcademicaResponse[]>([]);
    idGestionSel = '';
    periodos = signal<PeriodoEvaluacionResponse[]>([]);
    pesosPorPeriodo = signal<Record<string, PeriodoDimensionResponse[]>>({});
    loading = false;

    // Period dialog
    dialogPeriodoVisible = false;
    editMode = false;
    editPeriodoId = '';
    periodoForm: PeriodoForm = this.defaultPeriodoForm();
    tipoOptions = [
        { label: 'Anual', value: 'ANUAL' },
        { label: 'Semestral', value: 'SEMESTRAL' },
        { label: 'Trimestral', value: 'TRIMESTRAL' },
        { label: 'Bimestral', value: 'BIMESTRAL' },
    ];

    // Dimensions dialog
    dialogDimensionesVisible = false;
    dimensionesDisponibles = signal<{ label: string; value: string }[]>([]);
    selectedPeriodoId = '';

    ngOnInit(): void {
        this.gestionesSvc.listarGestiones().subscribe({
            next: (r) => { if (r.codigo === 200) this.gestiones.set(r.data ?? []); }
        });
        this.loadDimensionesDisponibles();
    }

    loadDimensionesDisponibles(): void {
        this.dimSvc.listarDimensiones().subscribe({
            next: (r) => {
                if (r.codigo === 200 && r.data) {
                    this.dimensionesDisponibles.set(r.data.map(d => ({ label: d.nombre, value: d.id })));
                }
            }
        });
    }

    onGestionChange(): void {
        if (!this.idGestionSel) return;
        this.loadPeriodos();
    }

    loadPeriodos(): void {
        this.loading = true;
        this.calSvc.listarPeriodosGestion(this.idGestionSel).subscribe({
            next: (r) => {
                this.loading = false;
                if (r.codigo === 200 && r.data) {
                    this.periodos.set(r.data);
                    // Load dynamic dimension weights for each period
                    r.data.forEach(p => this.loadPesosPeriodo(p.id));
                }
            },
            error: () => { this.loading = false; this.error('No se pudieron cargar los periodos'); }
        });
    }

    loadPesosPeriodo(idPeriodo: string): void {
        this.dimSvc.pesosPeriodo(idPeriodo).subscribe({
            next: (r) => {
                if (r.codigo === 200 && r.data?.length) {
                    this.pesosPorPeriodo.update(v => ({ ...v, [idPeriodo]: r.data! }));
                }
            }
        });
    }

    nuevoPeriodo(): void {
        const gestion = this.gestiones().find(g => g.id === this.idGestionSel);
        const tipo = gestion?.tipoPeriodo ?? 'BIMESTRAL';
        const sigNumero = (this.periodos().length || 0) + 1;
        const total = gestion?.cantidadPeriodos ?? 1;

        const form = { ...this.defaultPeriodoForm(), tipoPeriodo: tipo, numeroPeriodo: sigNumero };

        if (sigNumero === 1) form.fechaInicio = gestion?.fechaInicio ?? '';
        if (sigNumero === total) form.fechaFin = gestion?.fechaFin ?? '';
        if (total === 1) {
            form.fechaInicio = gestion?.fechaInicio ?? '';
            form.fechaFin = gestion?.fechaFin ?? '';
        }

        this.periodoForm = form;
        this.editMode = false;
        this.dialogPeriodoVisible = true;
    }

    editarPeriodo(p: PeriodoEvaluacionResponse): void {
        this.editPeriodoId = p.id;
        this.periodoForm = {
            numeroPeriodo: p.numeroPeriodo,
            tipoPeriodo: p.tipoPeriodo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
            pesos: this.pesosPorPeriodo()[p.id]?.map(pd => ({
                idDimension: pd.idDimension, nombre: pd.nombreDimension, ponderacion: pd.ponderacion
            })) ?? [
                { idDimension: '', nombre: 'SER', ponderacion: p.pesoSer },
                { idDimension: '', nombre: 'SABER', ponderacion: p.pesoSaber },
                { idDimension: '', nombre: 'HACER', ponderacion: p.pesoHacer },
                { idDimension: '', nombre: 'AUTOEVALUACION', ponderacion: p.pesoAuto },
            ]
        };
        this.editMode = true;
        this.dialogPeriodoVisible = true;
    }

    guardarPeriodo(): void {
        const f = this.periodoForm;
        if (!f.numeroPeriodo || !f.tipoPeriodo || !f.fechaInicio || !f.fechaFin) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete todos los campos', life: 3000 });
            return;
        }
        if (f.fechaFin <= f.fechaInicio) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Fecha fin debe ser posterior a inicio', life: 3000 });
            return;
        }

        const duracionDias = this.diasEntre(f.fechaInicio, f.fechaFin);
        const maxDias = this.maxDiasPorTipo(f.tipoPeriodo);
        if (maxDias && duracionDias > maxDias) {
            const msg = 'Un período ' + f.tipoPeriodo + ' no puede exceder ' + maxDias + ' días (tiene ' + duracionDias + ')';
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: msg, life: 4000 });
            return;
        }

        if (!this.idGestionSel) return;

        const gestion = this.gestiones().find(g => g.id === this.idGestionSel);
        const gInicio = gestion?.fechaInicio;
        const gFin = gestion?.fechaFin;
        if (gInicio && f.fechaInicio < gInicio) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La fecha inicio debe ser >= ' + gInicio + ' (inicio de la gestión)', life: 4000 });
            return;
        }
        if (gFin && f.fechaFin > gFin) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La fecha fin debe ser <= ' + gFin + ' (fin de la gestión)', life: 4000 });
            return;
        }

        if (this.editMode && this.editPeriodoId) {
            this.calSvc.actualizarFechasPeriodo(this.idGestionSel, this.editPeriodoId, f.fechaInicio, f.fechaFin).subscribe({
                next: () => {
                    this.dialogPeriodoVisible = false;
                    this.editPeriodoId = '';
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Período actualizado', life: 3000 });
                    this.loadPeriodos();
                },
                error: (e) => this.error(e.error?.mensaje ?? 'Error al actualizar el período')
            });
            return;
        }

        const body: PeriodoEvaluacionRequest = {
            numeroPeriodo: f.numeroPeriodo,
            tipoPeriodo: f.tipoPeriodo,
            fechaInicio: f.fechaInicio,
            fechaFin: f.fechaFin,
            pesoSer: 10, pesoSaber: 45, pesoHacer: 40, pesoAuto: 5
        };

        this.calSvc.crearPeriodosGestion(this.idGestionSel, [body]).subscribe({
            next: () => {
                this.dialogPeriodoVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Período creado. Use el botón de dimensiones para configurar ponderaciones.', life: 4000 });
                this.loadPeriodos();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al crear el período')
        });
    }

    editarDimensiones(p: PeriodoEvaluacionResponse): void {
        this.selectedPeriodoId = p.id;
        // Load dynamic weights if available
        const dynWeights = this.pesosPorPeriodo()[p.id];
        if (dynWeights?.length) {
            this.periodoForm.pesos = dynWeights.map(pd => ({
                idDimension: pd.idDimension, nombre: pd.nombreDimension, ponderacion: pd.ponderacion
            }));
        } else {
            this.periodoForm.pesos = [
                { idDimension: '', nombre: 'SER', ponderacion: p.pesoSer },
                { idDimension: '', nombre: 'SABER', ponderacion: p.pesoSaber },
                { idDimension: '', nombre: 'HACER', ponderacion: p.pesoHacer },
                { idDimension: '', nombre: 'AUTOEVALUACION', ponderacion: p.pesoAuto },
            ];
        }
        this.dialogDimensionesVisible = true;
    }

    agregarDimension(): void {
        this.periodoForm.pesos = [...this.periodoForm.pesos, { idDimension: '', nombre: '', ponderacion: 0 }];
    }

    quitarDimension(index: number): void {
        this.periodoForm.pesos = this.periodoForm.pesos.filter((_, i) => i !== index);
    }

    sumaPonderaciones(): number {
        return this.periodoForm.pesos.reduce((sum, p) => sum + (p.ponderacion || 0), 0);
    }

    guardarDimensiones(): void {
        if (!this.selectedPeriodoId) return;
        if (this.sumaPonderaciones() !== 100) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Las ponderaciones deben sumar 100%', life: 3000 });
            return;
        }
        const body = this.periodoForm.pesos.map(p => ({
            idDimension: p.idDimension, ponderacion: p.ponderacion
        }));
        this.dimSvc.actualizarPesosPeriodo(this.selectedPeriodoId, body).subscribe({
            next: () => {
                this.dialogDimensionesVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dimensiones actualizadas', life: 3000 });
                this.loadPeriodos();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al guardar dimensiones')
        });
    }

    confirmarEliminar(p: PeriodoEvaluacionResponse): void {
        this.confirmationService.confirm({
            message: '¿Eliminar el período ' + p.numeroPeriodo + '° (' + p.tipoPeriodo + ')? Se eliminarán también las calificaciones asociadas.',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Eliminación de período no implementada en este endpoint', life: 3000 });
            }
        });
    }

    private defaultPeriodoForm(): PeriodoForm {
        return { numeroPeriodo: 1, tipoPeriodo: 'BIMESTRAL', fechaInicio: '', fechaFin: '', pesos: [] };
    }

    private diasEntre(inicio: string, fin: string): number {
        return Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    private maxDiasPorTipo(tipo: string): number | null {
        switch (tipo) {
            case 'BIMESTRAL': return 62;
            case 'TRIMESTRAL': return 95;
            case 'SEMESTRAL': return 185;
            case 'ANUAL': return 366;
            default: return null;
        }
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
