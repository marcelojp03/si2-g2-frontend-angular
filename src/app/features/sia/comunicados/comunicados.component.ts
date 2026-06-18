import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/core/services/auth.service';
import { ComunicadosService } from '@/features/sia/comunicados/services/comunicados.service';
import { ComunicadoRequest, ComunicadoResponse } from '@/features/sia/comunicados/models/comunicado.models';

@Component({
    selector: 'app-comunicados',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, TextareaModule, InputIconModule, IconFieldModule,
        DialogModule, TooltipModule, ConfirmDialogModule, SelectModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './comunicados.component.html'
})
export class ComunicadosComponent implements OnInit {
    private service = inject(ComunicadosService);
    private auth = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    comunicados = signal<ComunicadoResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';
    saving = false;
    processingIds = new Set<string>();
    viewingDetail: ComunicadoResponse | null = null;
    detailVisible = false;

    readonly tipos = [
        { label: 'Todos', value: '' },
        { label: 'Aviso', value: 'AVISO' },
        { label: 'Circular', value: 'CIRCULAR' },
        { label: 'Evento', value: 'EVENTO' },
        { label: 'Urgente', value: 'URGENTE' }
    ];

    readonly destinatariosOptions = [
        { label: 'Todos', value: 'TODOS' },
        { label: 'Docentes', value: 'DOCENTES' },
        { label: 'Estudiantes', value: 'ESTUDIANTES' },
        { label: 'Tutores', value: 'TUTORES' },
        { label: 'Administrativos', value: 'ADMINISTRATIVOS' }
    ];

    readonly estadoOptions = [
        { label: 'Todos', value: '' },
        { label: 'Borrador', value: 'BORRADOR' },
        { label: 'Publicado', value: 'PUBLICADO' },
        { label: 'Archivado', value: 'ARCHIVADO' }
    ];

    filtros = { estado: '', tipo: '' };

    form: ComunicadoRequest = this.emptyForm();

    get canWrite(): boolean {
        return this.auth.hasRole('ADMIN_INSTITUCION') || this.auth.hasRole('DIRECTOR');
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.service.listar(this.filtros.estado || undefined, this.filtros.tipo || undefined).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.codigo === 200) this.comunicados.set(response.data ?? []);
            },
            error: () => {
                this.loading = false;
                this.error('No se pudieron cargar los comunicados');
            }
        });
    }

    nuevo(): void {
        this.form = this.emptyForm();
        this.selectedId = '';
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(c: ComunicadoResponse): void {
        this.form = { titulo: c.titulo, contenido: c.contenido, tipo: c.tipo, destinatarios: c.destinatarios };
        this.selectedId = c.id;
        this.editMode = true;
        this.dialogVisible = true;
    }

    verDetalle(c: ComunicadoResponse): void {
        this.viewingDetail = c;
        this.detailVisible = true;
    }

    guardar(): void {
        if (this.saving) return;
        if (!this.form.titulo?.trim() || !this.form.contenido?.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Titulo y contenido son requeridos', life: 3000 });
            return;
        }
        this.saving = true;
        const body: ComunicadoRequest = {
            titulo: this.form.titulo.trim(),
            contenido: this.form.contenido.trim(),
            tipo: this.form.tipo || 'AVISO',
            destinatarios: this.form.destinatarios || 'TODOS'
        };
        const obs = this.editMode
            ? this.service.actualizar(this.selectedId, body)
            : this.service.crear(body);
        obs.subscribe({
            next: () => {
                this.saving = false;
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: this.editMode ? 'Comunicado actualizado' : 'Comunicado creado', life: 3000 });
                this.load();
            },
            error: (e) => {
                this.saving = false;
                this.error(e.error?.mensaje ?? 'Error al guardar');
            }
        });
    }

    confirmarPublicar(c: ComunicadoResponse): void {
        if (this.processingIds.has(c.id)) return;
        this.confirmationService.confirm({
            message: `Publicar "${c.titulo}"? Los destinatarios recibiran una notificacion.`,
            header: 'Confirmar publicacion',
            icon: 'pi pi-send',
            accept: () => {
                if (this.processingIds.has(c.id)) return;
                this.processingIds.add(c.id);
                this.service.publicar(c.id).subscribe({
                    next: () => {
                        this.processingIds.delete(c.id);
                        this.messageService.add({ severity: 'success', summary: 'Publicado', detail: 'Comunicado publicado', life: 3000 });
                        this.load();
                    },
                    error: (e) => {
                        this.processingIds.delete(c.id);
                        this.error(e.error?.mensaje ?? 'Error al publicar');
                    }
                });
            }
        });
    }

    confirmarArchivar(c: ComunicadoResponse): void {
        if (this.processingIds.has(c.id)) return;
        this.confirmationService.confirm({
            message: `Archivar "${c.titulo}"?`,
            header: 'Confirmar archivado',
            icon: 'pi pi-archive',
            accept: () => {
                if (this.processingIds.has(c.id)) return;
                this.processingIds.add(c.id);
                this.service.archivar(c.id).subscribe({
                    next: () => {
                        this.processingIds.delete(c.id);
                        this.messageService.add({ severity: 'info', summary: 'Archivado', detail: 'Comunicado archivado', life: 3000 });
                        this.load();
                    },
                    error: (e) => {
                        this.processingIds.delete(c.id);
                        this.error(e.error?.mensaje ?? 'Error al archivar');
                    }
                });
            }
        });
    }

    estadoSeveridad(estado: string): string {
        switch (estado) {
            case 'PUBLICADO': return 'success';
            case 'BORRADOR': return 'warn';
            case 'ARCHIVADO': return 'secondary';
            default: return 'info';
        }
    }

    tipoSeveridad(tipo: string): string {
        switch (tipo) {
            case 'URGENTE': return 'danger';
            case 'EVENTO': return 'info';
            case 'CIRCULAR': return 'warn';
            default: return 'contrast';
        }
    }

    limpiarFiltros(): void {
        this.filtros = { estado: '', tipo: '' };
        this.load();
    }

    private emptyForm(): ComunicadoRequest {
        return { titulo: '', contenido: '', tipo: 'AVISO', destinatarios: 'TODOS' };
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
