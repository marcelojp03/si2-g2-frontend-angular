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
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InstitucionService } from '@/core/services/institucion.service';
import { StorageService } from '@/core/services/storage.service';
import { FileUploadComponent } from '@/shared/components/file-upload/file-upload.component';
import {
    ConfiguracionInstitucionRequest,
    ConfiguracionParametroResponse,
    InstitucionResponse
} from '@/core/models/sia.models';

@Component({
    selector: 'app-configuracion',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, DialogModule, TooltipModule, TextareaModule,
        ToggleSwitchModule, ProgressSpinnerModule, FileUploadComponent, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent implements OnInit {
    private institucionService  = inject(InstitucionService);
    private storageService      = inject(StorageService);
    private messageService      = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    configuraciones = signal<ConfiguracionParametroResponse[]>([]);
    institucionActual = signal<InstitucionResponse | null>(null);
    loading   = true;
    uploading = false;
    dialogVisible = false;
    editMode  = false;

    // Logo de la institución (sección separada)
    logoUrl   = signal<string | null>(null);
    logoId    = signal<string | null>(null);
    logoLoading = false;

    // Usados solo en el dialog
    configSeleccionada: ConfiguracionParametroResponse | null = null;
    valorTexto    = '';
    valorBooleano = false;
    descripcion   = '';

    get esBooleano()  { return this.configSeleccionada?.tipoValor === 'BOOLEANO'; }
    get esNumero()    { return this.configSeleccionada?.tipoValor === 'NUMERO'; }
    get usaSelector() { return !!this.configSeleccionada?.valoresPermitidos?.length; }
    get labelClave()  { return this.configSeleccionada?.nombre ?? ''; }
    get modulos()     { return [...new Set(this.configuraciones().map(c => c.modulo))]; }

    ngOnInit(): void {
        this.loadInstitucionActual();
    }

    loadInstitucionActual(): void {
        this.loading = true;
        this.institucionService.obtenerActual().subscribe({
            next: r => {
                if (r.codigo === 200 && r.data) {
                    this.institucionActual.set(r.data);
                    this.load();
                    this.loadLogo();
                    return;
                }
                this.loading = false;
            },
            error: () => { this.loading = false; this.error('No se pudo cargar la institución actual'); }
        });
    }

    load(): void {
        if (!this.institucionActual()) { this.loading = false; return; }
        this.loading = true;
        this.institucionService.listarCatalogoConfiguracionesActuales().subscribe({
            next: r => {
                this.loading = false;
                if (r.codigo === 200) this.configuraciones.set(r.data ?? []);
            },
            error: () => { this.loading = false; this.error('No se pudieron cargar las configuraciones'); }
        });
    }

    loadLogo(): void {
        const institucion = this.institucionActual();
        if (!institucion) return;
        this.storageService.getPrincipal('INSTITUCION', 'institucion', institucion.id, 'LOGO').subscribe({
            next: r => {
                if (r.codigo === 200 && r.data?.url) {
                    this.logoUrl.set(r.data.url);
                    this.logoId.set(r.data.id ?? null);
                }
            },
            error: () => { /* Sin logo previo — no es error */ }
        });
    }

    onLogoSeleccionado(file: File): void {
        const institucion = this.institucionActual();
        if (!institucion) return;
        this.uploading = true;
        this.storageService.upload(file, {
            modulo: 'INSTITUCION',
            entidad: 'institucion',
            idEntidad: institucion.id,
            tipoReferencia: 'LOGO',
            esPrincipal: true
        }).subscribe({
            next: r => {
                this.uploading = false;
                if (r.codigo === 200 && r.data?.url) {
                    this.logoUrl.set(r.data.url);
                    this.logoId.set(r.data.id ?? null);
                    this.messageService.add({ severity: 'success', summary: 'Logo actualizado', detail: 'El logo se subió correctamente', life: 3000 });
                }
            },
            error: () => { this.uploading = false; this.error('Error al subir el logo'); }
        });
    }

    onQuitarLogo(): void {
        const id = this.logoId();
        if (!id) { this.logoUrl.set(null); this.logoId.set(null); return; }
        this.storageService.eliminar(id).subscribe({
            next: () => {
                this.logoUrl.set(null);
                this.logoId.set(null);
                this.messageService.add({ severity: 'success', summary: 'Logo eliminado', detail: 'El logo fue quitado correctamente', life: 3000 });
            },
            error: () => this.error('No se pudo eliminar el logo')
        });
    }

    editar(c: ConfiguracionParametroResponse): void {
        this.configSeleccionada = c;
        if (this.esBooleano) {
            this.valorBooleano = c.valor.toLowerCase() === 'true';
            this.valorTexto    = '';
        } else {
            this.valorTexto    = c.valor;
            this.valorBooleano = false;
        }
        this.descripcion = c.descripcion ?? '';
        this.editMode = true;
        this.dialogVisible = true;
    }

    guardar(): void {
        const valor = this.esBooleano ? String(this.valorBooleano) : this.valorTexto.trim();
        if (!this.configSeleccionada || !valor) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Completa todos los campos requeridos', life: 3000 });
            return;
        }

        const request: ConfiguracionInstitucionRequest = {
            clave: this.configSeleccionada.clave,
            valor,
            tipoValor: this.configSeleccionada.tipoValor,
            descripcion: this.descripcion
        };

        this.institucionService.actualizarConfiguracionActual(request).subscribe({
            next: () => {
                this.dialogVisible = false;
                this.configSeleccionada = null;
                this.messageService.add({ severity: 'success', summary: 'Guardado', detail: `"${this.labelClave}" guardado correctamente`, life: 3000 });
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al guardar')
        });
    }

    restaurarDefault(c: ConfiguracionParametroResponse): void {
        this.confirmationService.confirm({
            message: `¿Restablecer la configuración "${c.nombre}" a su valor por defecto?`,
            header: 'Restablecer configuración',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Restablecer', severity: 'warn', icon: 'pi pi-refresh' },
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            accept: () => {
                this.institucionService.eliminarConfiguracionActual(c.clave).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Restablecido', detail: `"${c.nombre}" volvió a su valor por defecto`, life: 3000 });
                        this.load();
                    },
                    error: (e) => this.error(e.error?.mensaje ?? 'No se pudo restablecer la configuración')
                });
            }
        });
    }

    configuracionesPorModulo(modulo: string): ConfiguracionParametroResponse[] {
        return this.configuraciones().filter(c => c.modulo === modulo);
    }

    abrirEdicionDesdeTarjeta(config: ConfiguracionParametroResponse): void {
        this.editar(config);
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}



