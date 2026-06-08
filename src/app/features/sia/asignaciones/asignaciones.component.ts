import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
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
import { CanPermDirective } from '@/shared/directives/can-perm.directive';
import { AuthService } from '@/core/services/auth.service';
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
        ConfirmDialogModule, SelectModule, CanPermDirective],
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
    private auth = inject(AuthService);
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
                nombreDocente: this.getNombreDocente(asignacion),
                nombreMateria: this.getNombreMateria(asignacion),
                nombreCurso: idCurso ? this.getNombreCurso(idCurso) : 'Sin curso',
                nombreParalelo: paralelo?.nombre ?? asignacion.idParalelo,
                nombreGestion: this.getNombreGestion(asignacion)
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
            docentes: this.canRead('DOCENTES_READ') ? this.docentesService.listarDocentes().pipe(catchError(() => of({ codigo: 200, data: [] }))) : of({ codigo: 200, data: [] }),
            materias: this.canRead('MATERIAS_READ') ? this.materiasService.listarMaterias().pipe(catchError(() => of({ codigo: 200, data: [] }))) : of({ codigo: 200, data: [] }),
            cursos: this.canRead('CURSOS_READ') ? this.cursosService.listarCursos().pipe(catchError(() => of({ codigo: 200, data: [] }))) : of({ codigo: 200, data: [] }),
            paralelos: this.canRead('PARALELOS_READ') ? this.paralelosService.listarParalelos().pipe(catchError(() => of({ codigo: 200, data: [] }))) : of({ codigo: 200, data: [] }),
            gestiones: this.canRead('GESTIONES_READ') ? this.gestionesService.listarGestiones().pipe(catchError(() => of({ codigo: 200, data: [] }))) : of({ codigo: 200, data: [] })
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
        const docente = this.getNombreDocente(a);
        const materia = this.getNombreMateria(a);
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

    getNombreDocente(a: AsignacionDocenteResponse): string {
        if (a.nombreDocente) return a.nombreDocente;
        const id = a.idDocente;
        const d = this.docentes().find(x => x.id === id);
        return d ? `${d.apellidos}, ${d.nombres}` : id;
    }
    getNombreMateria(a: AsignacionDocenteResponse): string { return a.nombreMateria ?? this.materias().find(x => x.id === a.idMateria)?.nombre ?? a.idMateria; }
    getNombreParalelo(a: AsignacionDocenteResponse): string { return a.nombreParalelo ?? this.paralelos().find(x => x.id === a.idParalelo)?.nombre ?? a.idParalelo; }
    getNombreGestion(a: AsignacionDocenteResponse): string { return a.nombreGestion ?? this.gestiones().find(x => x.id === a.idGestion)?.nombre ?? a.idGestion; }
    getNombreCurso(idCurso: string): string { return this.cursos().find(x => x.id === idCurso)?.nombre ?? idCurso; }

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

    private canRead(permission: string): boolean {
        return this.auth.hasPermission(permission) || this.auth.hasRole('ADMIN_INSTITUCION') || this.auth.hasRole('DIRECTOR') || this.auth.hasRole('SUPER_ADMIN');
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
