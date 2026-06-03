import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { AsignacionesService } from '@/features/sia/asignaciones/services/asignaciones.service';
import { DocentesService } from '@/features/sia/docentes/services/docentes.service';
import { MateriasService } from '@/features/sia/materias/services/materias.service';
import { ParalelosService } from '@/features/sia/paralelos/services/paralelos.service';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';
import { CursosService } from '@/features/sia/cursos/services/cursos.service';
import {
    AsignacionDocenteRequest, AsignacionDocenteResponse,
    CursoResponse, DocenteResponse, MateriaResponse, ParaleloResponse, GestionAcademicaResponse
} from '@/core/models/sia.models';

type AsignacionDocenteView = AsignacionDocenteResponse & {
    idCurso: string;
    nombreCurso: string;
    nombreDocente: string;
    nombreMateria: string;
    nombreParalelo: string;
    nombreGestion: string;
};

@Component({
    selector: 'app-asignaciones',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule,
        ConfirmDialogModule, SelectModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './asignaciones.component.html'
})
export class AsignacionesComponent implements OnInit {
    private service = inject(AsignacionesService);
    private docentesService = inject(DocentesService);
    private materiasService = inject(MateriasService);
    private paralelosService = inject(ParalelosService);
    private gestionesService = inject(GestionesService);
    private cursosService = inject(CursosService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    asignaciones = signal<AsignacionDocenteResponse[]>([]);
    docentes = signal<DocenteResponse[]>([]);
    materias = signal<MateriaResponse[]>([]);
    cursos = signal<CursoResponse[]>([]);
    paralelos = signal<ParaleloResponse[]>([]);
    gestiones = signal<GestionAcademicaResponse[]>([]);
    paralelosFiltrados = signal<ParaleloResponse[]>([]);
    idCursoSeleccionado = '';

    asignacionesView = computed<AsignacionDocenteView[]>(() =>
        this.asignaciones().map((asignacion) => {
            const paralelo = this.getParalelo(asignacion.idParalelo);
            const idCurso = paralelo?.idCurso ?? '';
            return {
                ...asignacion,
                idCurso,
                nombreDocente: this.getNombreDocente(asignacion.idDocente),
                nombreMateria: this.getNombreMateria(asignacion.idMateria),
                nombreCurso: idCurso ? this.getNombreCurso(idCurso) : 'Sin curso',
                nombreParalelo: paralelo?.nombre ?? asignacion.idParalelo,
                nombreGestion: this.getNombreGestion(asignacion.idGestion)
            };
        })
    );

    loading = true;
    dialogVisible = false;
    form: AsignacionDocenteRequest = { idDocente: '', idMateria: '', idParalelo: '', idGestion: '' };

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        forkJoin({
            asignaciones: this.service.listarAsignaciones(),
            docentes: this.docentesService.listarDocentes(),
            materias: this.materiasService.listarMaterias(),
            cursos: this.cursosService.listarCursos(),
            paralelos: this.paralelosService.listarParalelos(),
            gestiones: this.gestionesService.listarGestiones()
        }).subscribe({
            next: ({ asignaciones, docentes, materias, cursos, paralelos, gestiones }) => {
                this.loading = false;
                if (asignaciones.codigo === 200) this.asignaciones.set(asignaciones.data ?? []);
                if (docentes.codigo === 200) this.docentes.set(docentes.data ?? []);
                if (materias.codigo === 200) this.materias.set(materias.data ?? []);
                if (cursos.codigo === 200) this.cursos.set(cursos.data ?? []);
                if (paralelos.codigo === 200) this.paralelos.set(paralelos.data ?? []);
                if (gestiones.codigo === 200) this.gestiones.set(gestiones.data ?? []);
            },
            error: () => { this.loading = false; this.error('No se pudo cargar la información'); }
        });
    }

    nueva(): void {
        this.form = { idDocente: '', idMateria: '', idParalelo: '', idGestion: '' };
        this.idCursoSeleccionado = '';
        this.paralelosFiltrados.set([]);
        this.dialogVisible = true;
    }

    onGestionChange(): void {
        this.idCursoSeleccionado = '';
        this.form.idParalelo = '';
        this.actualizarParalelosFiltrados();
    }

    onCursoChange(): void {
        this.form.idParalelo = '';
        this.actualizarParalelosFiltrados();
    }

    guardar(): void {
        if (!this.form.idDocente || !this.form.idMateria || !this.idCursoSeleccionado || !this.form.idParalelo || !this.form.idGestion) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete todos los campos', life: 3000 });
            return;
        }
        this.service.crearAsignacion(this.form).subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Asignación creada', life: 3000 });
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'Error al crear la asignación. Verifique que no exista una duplicada.')
        });
    }

    confirmarEliminar(a: AsignacionDocenteResponse): void {
        const docente = this.getNombreDocente(a.idDocente);
        const materia = this.getNombreMateria(a.idMateria);
        this.confirmationService.confirm({
            message: `¿Eliminar la asignación de "${docente}" en "${materia}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.service.eliminarAsignacion(a.id).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Asignación eliminada', life: 3000 }); this.load(); },
                error: () => this.error('No se pudo eliminar la asignación')
            })
        });
    }

    getNombreDocente(id: string): string {
        const d = this.docentes().find(x => x.id === id);
        return d ? `${d.apellidos}, ${d.nombres}` : id;
    }
    getNombreMateria(id: string): string { return this.materias().find(x => x.id === id)?.nombre ?? id; }
    getNombreCurso(id: string): string { return this.cursos().find(x => x.id === id)?.nombre ?? id; }
    getNombreParalelo(id: string): string { return this.getParalelo(id)?.nombre ?? id; }
    getNombreGestion(id: string): string { return this.gestiones().find(x => x.id === id)?.nombre ?? id; }

    get docentesOptions() {
        return this.docentes().map(d => ({ label: `${d.apellidos}, ${d.nombres}`, value: d.id }));
    }
    get materiasOptions() {
        return this.materias().map(m => ({ label: m.nombre, value: m.id }));
    }
    get gestionesOptions() {
        return this.gestiones().map(g => ({ label: g.nombre, value: g.id }));
    }
    get cursosOptions() {
        return this.cursos().map(c => ({ label: c.nombre, value: c.id }));
    }
    get paralelosOptions() {
        return this.paralelosFiltrados().map(p => ({ label: p.nombre, value: p.id }));
    }

    onGlobalFilter(t: Table, e: Event): void { t.filterGlobal((e.target as HTMLInputElement).value, 'contains'); }

    private actualizarParalelosFiltrados(): void {
        if (!this.form.idGestion || !this.idCursoSeleccionado) {
            this.paralelosFiltrados.set([]);
            return;
        }
        this.paralelosFiltrados.set(this.paralelos().filter(p =>
            p.idGestionAcademica === this.form.idGestion && p.idCurso === this.idCursoSeleccionado
        ));
    }

    private getParalelo(id: string): ParaleloResponse | undefined {
        return this.paralelos().find(x => x.id === id);
    }

    private error(msg: string): void { this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 }); }
}
