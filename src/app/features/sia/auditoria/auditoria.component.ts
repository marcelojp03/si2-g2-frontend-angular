import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuditoriaService } from '@/core/services/auditoria.service';
import { BitacoraAuditoriaResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-auditoria',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule, ToastModule],
    providers: [MessageService],
    templateUrl: './auditoria.component.html'
})
export class AuditoriaComponent implements OnInit {
    private auditoriaService = inject(AuditoriaService);
    private messageService = inject(MessageService);

    registros = signal<BitacoraAuditoriaResponse[]>([]);
    loading = true;
    modulo = '';
    tipoOperacion = '';
    exito: boolean | null = null;

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.auditoriaService.listar({ modulo: this.modulo || undefined, tipoOperacion: this.tipoOperacion || undefined, exito: this.exito }).subscribe({
            next: response => {
                this.loading = false;
                if (response.codigo === 200) this.registros.set(response.data ?? []);
            },
            error: (e) => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.mensaje ?? 'No se pudo cargar la auditoría', life: 4000 });
            }
        });
    }

    severity(exito: boolean) {
        return exito ? 'success' : 'danger';
    }
}
