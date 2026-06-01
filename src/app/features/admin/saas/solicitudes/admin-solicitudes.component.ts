import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SolicitudService } from '@/features/admin/saas/services/solicitud.service';
import { SolicitudOnboardingResponse } from '@/core/models/sia.models';
import { PagoSuscripcionResponse } from '@/features/admin/saas/models/saas-solicitud.models';

type EstadoFiltro = '' | 'PENDIENTE_REVISION' | 'APROBADA' | 'PENDIENTE_PAGO' | 'PAGADO' | 'ACTIVA' | 'RECHAZADA';

@Component({
    selector: 'app-admin-solicitudes',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, ToastModule, TagModule, InputTextModule,
        InputIconModule, IconFieldModule, DialogModule, TooltipModule,
        ConfirmDialogModule, SelectModule, TextareaModule, DividerModule,
    ],
    providers: [MessageService, ConfirmationService],
    template: `
    <p-toast />
    <p-confirmDialog />

    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Solicitudes de onboarding</h2>
                <p class="text-gray-500 text-sm mt-1">Gestión del ciclo de vida de solicitudes institucionales</p>
            </div>
            <div class="flex items-center gap-3">
                <p-select [(ngModel)]="estadoFiltro" [options]="opcionesEstado"
                          optionLabel="label" optionValue="value"
                          placeholder="Todos los estados"
                          (onChange)="cargar()" class="w-52" />
                <p-iconfield>
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText [(ngModel)]="busqueda" placeholder="Buscar..." (input)="dt.filterGlobal(busqueda, 'contains')" class="w-52" />
                </p-iconfield>
            </div>
        </div>

        <p-table #dt [value]="solicitudes()" [loading]="loading" [paginator]="true" [rows]="15"
                 [globalFilterFields]="['nombreInstitucion','correoContacto','nombresContacto','apellidosContacto','nombrePlan']"
                 dataKey="id" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="nombreInstitucion">Institución <p-sortIcon field="nombreInstitucion" /></th>
                    <th pSortableColumn="tipoInstitucion">Tipo <p-sortIcon field="tipoInstitucion" /></th>
                    <th>Contacto</th>
                    <th pSortableColumn="nombrePlan">Plan <p-sortIcon field="nombrePlan" /></th>
                    <th pSortableColumn="estado">Estado <p-sortIcon field="estado" /></th>
                    <th pSortableColumn="creadoEn">Fecha <p-sortIcon field="creadoEn" /></th>
                    <th class="text-right">Acciones</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-s>
                <tr>
                    <td>
                        <div class="font-medium">{{ s.nombreInstitucion }}</div>
                        @if (s.correoInstitucion) {
                            <div class="text-xs text-gray-400">{{ s.correoInstitucion }}</div>
                        }
                    </td>
                    <td>
                        <p-tag [value]="s.tipoInstitucion" severity="secondary" />
                    </td>
                    <td>
                        <div class="text-sm">{{ s.nombresContacto }} {{ s.apellidosContacto }}</div>
                        <div class="text-xs text-gray-400">{{ s.correoContacto }}</div>
                    </td>
                    <td class="text-sm">{{ s.nombrePlan }}</td>
                    <td>
                        <p-tag [value]="s.estado" [severity]="severidadEstado(s.estado)" />
                    </td>
                    <td class="text-xs text-gray-500">{{ s.creadoEn | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-right">
                        <div class="flex items-center justify-end gap-1">
                            <button pButton icon="pi pi-eye" severity="secondary" size="small" text
                                    pTooltip="Ver detalle" (click)="verDetalle(s)"></button>
                            @if (s.estado === 'PENDIENTE_REVISION') {
                                <button pButton icon="pi pi-check" severity="success" size="small" text
                                        pTooltip="Aprobar" (click)="abrirAccion(s, 'aprobar')"></button>
                                <button pButton icon="pi pi-times" severity="danger" size="small" text
                                        pTooltip="Rechazar" (click)="abrirAccion(s, 'rechazar')"></button>
                            }
                            @if (s.estado === 'APROBADA') {
                                <button pButton icon="pi pi-qrcode" severity="info" size="small" text
                                        pTooltip="Generar QR de pago" (click)="generarQr(s)"></button>
                                <button pButton icon="pi pi-credit-card" severity="success" size="small" text
                                        pTooltip="Confirmar pago (manual)" (click)="confirmarPago(s)"></button>
                                <button pButton icon="pi pi-times" severity="danger" size="small" text
                                        pTooltip="Rechazar" (click)="abrirAccion(s, 'rechazar')"></button>
                            }
                            @if (s.estado === 'PENDIENTE_PAGO') {
                                <button pButton icon="pi pi-qrcode" severity="info" size="small" text
                                        pTooltip="Ver QR de pago" (click)="verQr(s)"></button>
                                <button pButton icon="pi pi-credit-card" severity="success" size="small" text
                                        pTooltip="Confirmar pago (manual)" (click)="confirmarPago(s)"></button>
                            }
                            @if (s.estado === 'PAGADO') {
                                <button pButton icon="pi pi-play" severity="success" size="small" text
                                        pTooltip="Activar institución" (click)="activar(s)"></button>
                            }
                        </div>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7" class="text-center py-10 text-gray-400">
                        <i class="pi pi-inbox text-4xl block mb-2"></i>
                        No hay solicitudes
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>

    <!-- DIALOG DETALLE -->
    <p-dialog [(visible)]="detalleVisible" header="Detalle de solicitud" [modal]="true"
              [style]="{ width: '650px' }" [closable]="true">
        @if (seleccionada()) {
            <div class="space-y-4 text-sm">
                <div class="grid grid-cols-2 gap-4">
                    <div><span class="text-gray-500">Institución:</span> <strong>{{ seleccionada()!.nombreInstitucion }}</strong></div>
                    <div><span class="text-gray-500">Tipo:</span> {{ seleccionada()!.tipoInstitucion }}</div>
                    <div><span class="text-gray-500">Correo inst.:</span> {{ seleccionada()!.correoInstitucion || '—' }}</div>
                    <div><span class="text-gray-500">Teléfono inst.:</span> {{ seleccionada()!.telefonoInstitucion || '—' }}</div>
                    <div class="col-span-2"><span class="text-gray-500">Dirección:</span> {{ seleccionada()!.direccionInstitucion || '—' }}</div>
                </div>
                <p-divider />
                <div class="grid grid-cols-2 gap-4">
                    <div><span class="text-gray-500">Contacto:</span> {{ seleccionada()!.nombresContacto }} {{ seleccionada()!.apellidosContacto }}</div>
                    <div><span class="text-gray-500">Correo:</span> {{ seleccionada()!.correoContacto }}</div>
                    <div><span class="text-gray-500">Teléfono:</span> {{ seleccionada()!.telefonoContacto || '—' }}</div>
                    <div><span class="text-gray-500">Plan:</span> {{ seleccionada()!.nombrePlan }}</div>
                </div>
                @if (seleccionada()!.mensaje) {
                    <p-divider />
                    <div>
                        <span class="text-gray-500">Mensaje:</span>
                        <p class="mt-1 p-3 bg-gray-50 rounded">{{ seleccionada()!.mensaje }}</p>
                    </div>
                }
                @if (seleccionada()!.notasAdmin) {
                    <div>
                        <span class="text-gray-500">Notas del admin:</span>
                        <p class="mt-1 p-3 bg-yellow-50 rounded">{{ seleccionada()!.notasAdmin }}</p>
                    </div>
                }
                @if (seleccionada()!.idInstitucionCreada) {
                    <p-divider />
                    <div class="p-3 bg-green-50 rounded text-green-800">
                        <i class="pi pi-check-circle mr-2"></i>
                        Institución creada: <strong>{{ seleccionada()!.idInstitucionCreada }}</strong>
                    </div>
                }
                <div class="flex justify-between items-center pt-2">
                    <p-tag [value]="seleccionada()!.estado" [severity]="severidadEstado(seleccionada()!.estado)" />
                    <span class="text-gray-400 text-xs">{{ seleccionada()!.creadoEn | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
            </div>
        }
    </p-dialog>

    <!-- DIALOG ACCIÓN (aprobar / rechazar) -->
    <p-dialog [(visible)]="accionVisible" [header]="accionTitulo" [modal]="true"
              [style]="{ width: '480px' }">
        <p class="text-gray-600 mb-4">{{ accionDescripcion }}</p>
        <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Notas internas (opcional)</label>
            <textarea pTextarea [(ngModel)]="notasAdmin" rows="4" maxlength="2000"
                      placeholder="Razón de la decisión, observaciones..."></textarea>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancelar" severity="secondary" (click)="accionVisible = false"></button>
            <button pButton [label]="accionLabel" [severity]="accionSeverity"
                    [loading]="procesando()" (click)="ejecutarAccion()"></button>
        </ng-template>
    </p-dialog>

    <!-- DIALOG QR DE PAGO -->
    <p-dialog [(visible)]="qrVisible" header="Pago de suscripción (Vpay)" [modal]="true"
              [style]="{ width: '440px' }" (onHide)="detenerPolling()">
        @if (pago()) {
            <div class="flex flex-col items-center text-center gap-3">
                @if (pagoConfirmado()) {
                    <div class="w-full p-4 bg-green-50 rounded text-green-800">
                        <i class="pi pi-check-circle text-3xl block mb-2"></i>
                        <p class="font-semibold">¡Pago confirmado!</p>
                        <p class="text-sm">Ya puedes activar la institución.</p>
                    </div>
                } @else {
                    @if (pago()!.qrBase64) {
                        <img [src]="'data:image/png;base64,' + pago()!.qrBase64" alt="QR de pago"
                             class="w-64 h-64 border rounded" />
                    } @else {
                        <div class="w-64 h-64 flex items-center justify-center border rounded text-gray-400">
                            QR no disponible
                        </div>
                    }
                    <div class="text-2xl font-bold text-emerald-600">
                        {{ pago()!.moneda }} {{ pago()!.monto | number:'1.2-2' }}
                    </div>
                    <p class="text-sm text-gray-500">Escanea el QR desde tu app de banca móvil.</p>
                    <div class="flex items-center gap-2 text-sm text-amber-600">
                        <i class="pi pi-spin pi-spinner"></i>
                        Esperando confirmación del pago...
                    </div>
                    @if (pago()!.proveedor === 'VPAY_DEMO') {
                        <p class="text-xs text-gray-400">Modo DEMO: usa "Confirmar pago (manual)" para simular el pago.</p>
                    }
                }
            </div>
        }
        <ng-template pTemplate="footer">
            <button pButton label="Cerrar" severity="secondary" (click)="qrVisible = false"></button>
            <button pButton label="Verificar ahora" icon="pi pi-refresh" severity="info"
                    [loading]="verificando()" [disabled]="pagoConfirmado()" (click)="verificarPago()"></button>
        </ng-template>
    </p-dialog>
    `,
})
export class AdminSolicitudesComponent implements OnInit {
    private service = inject(SolicitudService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    solicitudes = signal<SolicitudOnboardingResponse[]>([]);
    seleccionada = signal<SolicitudOnboardingResponse | null>(null);
    loading = false;
    procesando = signal(false);

    estadoFiltro: EstadoFiltro = '';
    busqueda = '';

    detalleVisible = false;
    accionVisible = false;
    accionTipo: 'aprobar' | 'rechazar' = 'aprobar';
    notasAdmin = '';

    // Pago / QR
    qrVisible = false;
    pago = signal<PagoSuscripcionResponse | null>(null);
    pagoConfirmado = signal(false);
    verificando = signal(false);
    private pollingId: ReturnType<typeof setInterval> | null = null;

    @ViewChild('dt') dt!: Table;

    opcionesEstado = [
        { label: 'Todos', value: '' },
        { label: 'Pendiente revisión', value: 'PENDIENTE_REVISION' },
        { label: 'Aprobada', value: 'APROBADA' },
        { label: 'Pendiente pago', value: 'PENDIENTE_PAGO' },
        { label: 'Pagado', value: 'PAGADO' },
        { label: 'Activa', value: 'ACTIVA' },
        { label: 'Rechazada', value: 'RECHAZADA' },
    ];

    get accionTitulo(): string {
        return this.accionTipo === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud';
    }
    get accionDescripcion(): string {
        return this.accionTipo === 'aprobar'
            ? 'La solicitud pasará al estado APROBADA. Se notificará al contacto.'
            : 'La solicitud será rechazada y no podrá avanzar.';
    }
    get accionLabel(): string { return this.accionTipo === 'aprobar' ? 'Aprobar' : 'Rechazar'; }
    get accionSeverity(): 'success' | 'danger' { return this.accionTipo === 'aprobar' ? 'success' : 'danger'; }

    ngOnInit(): void { this.cargar(); }

    cargar(): void {
        this.loading = true;
        this.service.listar(this.estadoFiltro || undefined).subscribe({
            next: res => {
                if (res.codigo === 200) this.solicitudes.set(res.data ?? []);
                this.loading = false;
            },
            error: () => this.loading = false,
        });
    }

    verDetalle(s: SolicitudOnboardingResponse): void {
        this.seleccionada.set(s);
        this.detalleVisible = true;
    }

    abrirAccion(s: SolicitudOnboardingResponse, tipo: 'aprobar' | 'rechazar'): void {
        this.seleccionada.set(s);
        this.accionTipo = tipo;
        this.notasAdmin = '';
        this.accionVisible = true;
    }

    ejecutarAccion(): void {
        const id = this.seleccionada()!.id;
        this.procesando.set(true);
        const obs = this.accionTipo === 'aprobar'
            ? this.service.aprobar(id, this.notasAdmin)
            : this.service.rechazar(id, this.notasAdmin);

        obs.subscribe({
            next: res => {
                this.procesando.set(false);
                this.accionVisible = false;
                if (res.codigo === 200) {
                    this.messageService.add({ severity: 'success', summary: 'Hecho', detail: res.mensaje });
                    this.cargar();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje });
                }
            },
            error: err => {
                this.procesando.set(false);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje ?? 'Error al procesar' });
            },
        });
    }

    confirmarPago(s: SolicitudOnboardingResponse): void {
        this.confirmationService.confirm({
            message: `¿Confirmar el pago de la solicitud de <strong>${s.nombreInstitucion}</strong>?`,
            header: 'Confirmar pago',
            icon: 'pi pi-credit-card',
            acceptLabel: 'Confirmar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.service.confirmarPago(s.id).subscribe({
                    next: res => {
                        if (res.codigo === 200) {
                            this.messageService.add({ severity: 'success', summary: 'Pago confirmado', detail: res.mensaje });
                            this.cargar();
                        }
                    },
                    error: err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje ?? 'Error' }),
                });
            },
        });
    }

    // ── Pago / QR (Vpay) ──────────────────────────────────────────────────────

    generarQr(s: SolicitudOnboardingResponse): void {
        this.seleccionada.set(s);
        this.pago.set(null);
        this.pagoConfirmado.set(false);
        this.qrVisible = true;
        this.service.generarQr(s.id).subscribe({
            next: res => {
                if (res.codigo === 200 || res.codigo === 201) {
                    this.pago.set(res.data ?? null);
                    this.messageService.add({ severity: 'success', summary: 'QR generado', detail: 'Se envió el QR al correo del contacto.' });
                    this.iniciarPolling();
                    this.cargar();
                }
            },
            error: err => {
                this.qrVisible = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje ?? 'No se pudo generar el QR' });
            },
        });
    }

    verQr(s: SolicitudOnboardingResponse): void {
        this.seleccionada.set(s);
        this.pago.set(null);
        this.pagoConfirmado.set(false);
        this.qrVisible = true;
        this.service.obtenerPago(s.id).subscribe({
            next: res => {
                if (res.codigo === 200 && res.data) {
                    this.pago.set(res.data);
                    if (res.data.estado === 'PAGADO') {
                        this.pagoConfirmado.set(true);
                    } else {
                        this.iniciarPolling();
                    }
                }
            },
            error: () => this.messageService.add({ severity: 'warn', summary: 'Sin pago', detail: 'No se encontró un pago para esta solicitud.' }),
        });
    }

    verificarPago(): void {
        const pago = this.pago();
        if (!pago) return;
        this.verificando.set(true);
        this.service.estadoPago(pago.id).subscribe({
            next: res => {
                this.verificando.set(false);
                if (res.codigo === 200 && res.data?.pagado) {
                    this.onPagoConfirmado();
                }
            },
            error: () => this.verificando.set(false),
        });
    }

    private iniciarPolling(): void {
        this.detenerPolling();
        this.pollingId = setInterval(() => {
            const pago = this.pago();
            if (!pago || this.pagoConfirmado()) {
                this.detenerPolling();
                return;
            }
            this.service.estadoPago(pago.id).subscribe({
                next: res => {
                    if (res.codigo === 200 && res.data?.pagado) {
                        this.onPagoConfirmado();
                    }
                },
            });
        }, 5000);
    }

    detenerPolling(): void {
        if (this.pollingId) {
            clearInterval(this.pollingId);
            this.pollingId = null;
        }
    }

    private onPagoConfirmado(): void {
        this.pagoConfirmado.set(true);
        this.detenerPolling();
        this.messageService.add({ severity: 'success', summary: 'Pago confirmado', detail: 'La institución ya puede activarse.' });
        this.cargar();
    }

    activar(s: SolicitudOnboardingResponse): void {
        this.confirmationService.confirm({
            message: `Se creará la institución <strong>${s.nombreInstitucion}</strong> y su usuario administrador. ¿Continuar?`,
            header: 'Activar institución',
            icon: 'pi pi-play',
            acceptLabel: 'Activar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                this.service.activar(s.id).subscribe({
                    next: res => {
                        if (res.codigo === 200) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Institución activada',
                                detail: 'La institución y el usuario administrador fueron creados. Revisa los logs del servidor para obtener la contraseña temporal.',
                                life: 8000,
                            });
                            this.cargar();
                        }
                    },
                    error: err => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje ?? 'Error al activar' }),
                });
            },
        });
    }

    severidadEstado(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (estado) {
            case 'ACTIVA': return 'success';
            case 'APROBADA': return 'info';
            case 'PAGADO': return 'info';
            case 'PENDIENTE_REVISION': return 'warn';
            case 'PENDIENTE_PAGO': return 'warn';
            case 'RECHAZADA': return 'danger';
            default: return 'secondary';
        }
    }
}
