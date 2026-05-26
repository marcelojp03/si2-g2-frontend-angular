import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { SaasService } from '@/core/services/saas.service';
import { IntentoLoginResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-seguridad',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputIconModule, IconFieldModule, CheckboxModule, TooltipModule],
    providers: [MessageService],
    templateUrl: './seguridad.component.html',
})
export class SeguridadComponent implements OnInit {
    private service = inject(SaasService);
    private messageService = inject(MessageService);

    intentos = signal<IntentoLoginResponse[]>([]);
    loading = true;

    filtroCorreo = '';
    filtroSoloFallos = false;
    filtroFechaDesde = '';
    filtroFechaHasta = '';

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        this.service.listarIntentosLogin({
            correo: this.filtroCorreo || undefined,
            soloFallos: this.filtroSoloFallos || undefined,
            fechaDesde: this.filtroFechaDesde || undefined,
            fechaHasta: this.filtroFechaHasta || undefined,
            limite: 200,
        }).subscribe({
            next: r => { this.loading = false; if (r.codigo === 200) this.intentos.set(r.data ?? []); },
            error: () => { this.loading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los intentos de login', life: 5000 }); }
        });
    }

    limpiar(): void {
        this.filtroCorreo = '';
        this.filtroSoloFallos = false;
        this.filtroFechaDesde = '';
        this.filtroFechaHasta = '';
        this.load();
    }

    exitoSeverity(exito: boolean): 'success' | 'danger' {
        return exito ? 'success' : 'danger';
    }
}
