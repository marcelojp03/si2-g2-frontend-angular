import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
import { DocentesService } from '@/features/sia/docentes/services/docentes.service';
import { StorageService } from '@/core/services/storage.service';
import { FileUploadComponent } from '@/shared/components/file-upload/file-upload.component';
import { CanPermDirective } from '@/shared/directives/can-perm.directive';
import { DocenteResponse, DocenteRequest, MateriaResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-docentes',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule,
        ConfirmDialogModule, MultiSelectModule, FileUploadComponent, CanPermDirective],
    providers: [MessageService, ConfirmationService],
    templateUrl: './docentes.component.html'
})
export class DocentesComponent implements OnInit {
    private service = inject(DocentesService);
    private storageService = inject(StorageService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    docentes = signal<DocenteResponse[]>([]);
    materias = signal<MateriaResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';

    fotoUrl = signal<string | null>(null);
    fotoArchivo: File | null = null;
    uploadingFoto = false;

    form: DocenteRequest = {
        codigo: '', documentoIdentidad: '', nombres: '', apellidos: '',
        telefono: '', correo: '', idsMateria: []
    };

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        forkJoin({
            docentes: this.service.listarDocentes(),
            materias: this.service.listarMaterias()
        }).subscribe({
            next: ({ docentes, materias }) => {
                this.loading = false;
                if (docentes.codigo === 200) this.docentes.set(docentes.data ?? []);
                if (materias.codigo === 200) this.materias.set(materias.data ?? []);
            },
            error: () => { this.loading = false; this.error('No se pudieron cargar los docentes'); }
        });
    }

    get materiasOptions() {
        return this.materias()
            .filter(m => m.estado === 'ACTIVO')
            .map(m => ({ label: `${m.nombre} (${m.codigo})`, value: m.id }));
    }

    nuevo(): void {
        this.form = {
            codigo: '', documentoIdentidad: '', nombres: '', apellidos: '',
            telefono: '', correo: '', idsMateria: []
        };
        this.fotoUrl.set(null);
        this.fotoArchivo = null;
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(d: DocenteResponse): void {
        this.form = {
            codigo: d.codigo,
            documentoIdentidad: d.documentoIdentidad,
            nombres: d.nombres,
            apellidos: d.apellidos,
            telefono: d.telefono ?? '',
            correo: d.correo,
            idsMateria: (d.materias ?? []).map(m => m.id)
        };
        this.selectedId = d.id;
        this.fotoArchivo = null;
        this.fotoUrl.set(null);
        this.editMode = true;
        this.dialogVisible = true;
        this.loadFoto(d.id);
    }

    private loadFoto(id: string): void {
        this.storageService.getPrincipal('DOCENTE', 'docente', id, 'FOTO_PERFIL').subscribe({
            next: r => { if (r.codigo === 200 && r.data?.url) this.fotoUrl.set(r.data.url); },
            error: () => { /* Sin foto previa */ }
        });
    }

    onFotoSeleccionada(file: File): void { this.fotoArchivo = file; }

    guardar(): void {
        if (!this.form.codigo || !this.form.nombres || !this.form.apellidos || !this.form.documentoIdentidad || !this.form.correo) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete los campos requeridos', life: 3000 });
            return;
        }
        const obs = this.editMode
            ? this.service.actualizarDocente(this.selectedId, this.form)
            : this.service.crearDocente(this.form);
        obs.subscribe({
            next: (r) => {
                const id = this.editMode ? this.selectedId : r.data?.id;
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.editMode ? 'Docente actualizado' : 'Docente registrado', life: 3000 });
                if (id && this.fotoArchivo) this.subirFoto(id, this.fotoArchivo);
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al guardar el docente')
        });
    }

    private subirFoto(id: string, file: File): void {
        this.uploadingFoto = true;
        this.storageService.upload(file, { modulo: 'DOCENTE', entidad: 'docente', idEntidad: id, tipoReferencia: 'FOTO_PERFIL' }).subscribe({
            next: () => { this.uploadingFoto = false; },
            error: () => { this.uploadingFoto = false; this.error('Docente guardado, pero hubo un error al subir la foto'); }
        });
    }

    confirmarEliminar(d: DocenteResponse): void {
        this.confirmationService.confirm({
            message: `¿Eliminar al docente "${d.nombres} ${d.apellidos}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.service.eliminarDocente(d.id).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Docente eliminado', life: 3000 }); this.load(); },
                error: () => this.error('No se pudo eliminar el docente')
            })
        });
    }

    onGlobalFilter(t: Table, e: Event): void { t.filterGlobal((e.target as HTMLInputElement).value, 'contains'); }
    private error(msg: string): void { this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 }); }
}
