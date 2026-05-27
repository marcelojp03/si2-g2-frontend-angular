import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/core/services/auth.service';
import { AulasService } from '@/features/sia/aulas/services/aulas.service';
import { AulaRequest, AulaResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-aulas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToastModule,
        TagModule,
        InputTextModule,
        InputIconModule,
        IconFieldModule,
        DialogModule,
        TooltipModule,
        ConfirmDialogModule,
        SelectModule,
        InputNumberModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './aulas.component.html'
})
export class AulasComponent implements OnInit {
    private service = inject(AulasService);
    private auth = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    aulas = signal<AulaResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editMode = false;
    selectedId = '';
    recursoManual = '';

    readonly recursosBase = ['Pizarra', 'Proyector', 'Laboratorio', 'Computadoras', 'Internet', 'Audio'];
    readonly estadoOptions = [
        { label: 'Todos', value: '' },
        { label: 'Activo', value: 'ACTIVO' },
        { label: 'Inactivo', value: 'INACTIVO' }
    ];

    filtros = {
        estado: '',
        capacidadMin: null as number | null,
        capacidadMax: null as number | null,
        recurso: '',
        q: ''
    };

    form: AulaRequest = this.emptyForm();

    @ViewChild('dt') dt!: Table;

    get canWrite(): boolean {
        return this.auth.hasPermission('GESTION_WRITE') ||
            this.auth.hasRole('ADMIN_INSTITUCION') ||
            this.auth.hasRole('DIRECTOR') ||
            this.auth.hasRole('SUPER_ADMIN');
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.service.listarAulas(this.filtros).subscribe({
            next: (response) => {
                this.loading = false;
                if (response.codigo === 200) {
                    this.aulas.set(response.data ?? []);
                }
            },
            error: () => {
                this.loading = false;
                this.error('No se pudieron cargar las aulas');
            }
        });
    }

    nuevo(): void {
        this.form = this.emptyForm();
        this.recursoManual = '';
        this.selectedId = '';
        this.editMode = false;
        this.dialogVisible = true;
    }

    editar(aula: AulaResponse): void {
        this.form = {
            codigo: aula.codigo,
            nombre: aula.nombre,
            capacidad: aula.capacidad,
            ubicacion: aula.ubicacion,
            recursos: [...(aula.recursos ?? [])]
        };
        this.recursoManual = '';
        this.selectedId = aula.id;
        this.editMode = true;
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.codigo?.trim() || !this.form.nombre?.trim() || !this.form.capacidad) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Atencion',
                detail: 'Codigo, nombre y capacidad son requeridos',
                life: 3000
            });
            return;
        }

        const body: AulaRequest = {
            ...this.form,
            codigo: this.form.codigo.trim(),
            nombre: this.form.nombre.trim(),
            ubicacion: this.form.ubicacion?.trim() || undefined,
            recursos: this.form.recursos.map(item => item.trim()).filter(Boolean)
        };
        const obs = this.editMode
            ? this.service.actualizarAula(this.selectedId, body)
            : this.service.crearAula(body);

        obs.subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Exito',
                    detail: this.editMode ? 'Aula actualizada' : 'Aula creada',
                    life: 3000
                });
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al guardar el aula')
        });
    }

    confirmarEliminar(aula: AulaResponse): void {
        this.confirmationService.confirm({
            message: `Desactivar el aula "${aula.nombre}"?`,
            header: 'Confirmar desactivacion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.service.eliminarAula(aula.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Desactivada', detail: 'Aula desactivada', life: 3000 });
                    this.load();
                },
                error: (e) => this.error(e.error?.mensaje ?? 'No se pudo desactivar: el aula tiene horarios activos')
            })
        });
    }

    toggleRecurso(recurso: string, checked: boolean): void {
        const recursos = new Set(this.form.recursos);
        if (checked) {
            recursos.add(recurso);
        } else {
            recursos.delete(recurso);
        }
        this.form.recursos = Array.from(recursos);
    }

    tieneRecurso(recurso: string): boolean {
        return this.form.recursos.includes(recurso);
    }

    agregarRecursoManual(): void {
        const value = this.recursoManual.trim();
        if (!value) return;
        if (!this.form.recursos.includes(value)) {
            this.form.recursos = [...this.form.recursos, value];
        }
        this.recursoManual = '';
    }

    quitarRecurso(recurso: string): void {
        this.form.recursos = this.form.recursos.filter(item => item !== recurso);
    }

    limpiarFiltros(): void {
        this.filtros = { estado: '', capacidadMin: null, capacidadMax: null, recurso: '', q: '' };
        this.load();
    }

    usarRecursoPreset(recurso: string): void {
        this.filtros.recurso = this.filtros.recurso === recurso ? '' : recurso;
        this.load();
    }

    filtrosActivosCount(): number {
        let count = 0;
        if (this.filtros.estado) count++;
        if (this.filtros.capacidadMin != null) count++;
        if (this.filtros.capacidadMax != null) count++;
        if (this.filtros.recurso) count++;
        if (this.filtros.q.trim()) count++;
        return count;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private emptyForm(): AulaRequest {
        return { codigo: '', nombre: '', capacidad: null, ubicacion: '', recursos: [] };
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
