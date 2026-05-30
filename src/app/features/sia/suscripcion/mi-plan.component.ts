import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SaasService } from '@/core/services/saas.service';
import { SuscripcionInstitucionResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-mi-plan',
    standalone: true,
    imports: [CommonModule, TagModule, CardModule, ButtonModule, ToastModule],
    providers: [MessageService],
    templateUrl: './mi-plan.component.html',
})
export class MiPlanComponent implements OnInit {
    private service = inject(SaasService);
    private messageService = inject(MessageService);

    suscripcion = signal<SuscripcionInstitucionResponse | null>(null);
    loading = true;

    ngOnInit(): void {
        this.service.obtenerSuscripcionActiva().subscribe({
            next: r => {
                this.loading = false;
                if (r.codigo === 200 && r.data) this.suscripcion.set(r.data);
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el plan activo', life: 4000 });
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

    formatMb(mb: number): string {
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb} MB`;
    }
}
