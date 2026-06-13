import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CuotaService } from '@/features/sia/cuotas/services/cuota.service';
import { CuotaEstudianteResponse, PagoResponse } from '@/features/sia/planes-pago/models/plan-pago.models';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';

@Component({
    selector: 'app-cuotas',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, ToastModule],
    providers: [MessageService],
    templateUrl: './cuotas.component.html'
})
export class CuotasComponent implements OnInit {
    private cuotaService = inject(CuotaService);
    private gestionService = inject(GestionesService);
    private messageService = inject(MessageService);

    cuotas = signal<CuotaEstudianteResponse[]>([]);
    pagos = signal<PagoResponse[]>([]);
    loading = true;
    gestionId = '';

    ngOnInit(): void {
        this.gestionService.listarGestiones().subscribe({
            next: (r) => {
                if (r.codigo === 200) {
                    const activa = (r.data ?? []).find((g: any) => g.activa);
                    if (activa) {
                        this.gestionId = activa.id;
                        this.loadCuotas();
                        this.loadPagos();
                    }
                }
            },
            error: () => this.error('No se pudo cargar la gestion activa')
        });
    }

    loadCuotas(): void {
        this.loading = true;
        this.cuotaService.misCuotas(this.gestionId).subscribe({
            next: (r) => { this.loading = false; if (r.codigo === 200) this.cuotas.set(r.data ?? []); },
            error: () => { this.loading = false; this.error('Error al cargar cuotas'); }
        });
    }

    loadPagos(): void {
        this.cuotaService.misPagos().subscribe({
            next: (r) => { if (r.codigo === 200) this.pagos.set(r.data ?? []); },
            error: () => {}
        });
    }

    estadoSeveridad(estado: string): string {
        switch (estado) {
            case 'PENDIENTE': return 'warn';
            case 'PAGADA': return 'success';
            case 'VENCIDA': return 'danger';
            case 'ANULADA': return 'secondary';
            default: return 'info';
        }
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
