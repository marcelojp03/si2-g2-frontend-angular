import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CalificacionService } from '@/features/sia/calificaciones/services/calificacion.service';
import { SiaService } from '@/core/services/sia.service';
import {
    ActividadEvaluativaRequest,
    ActividadEvaluativaResponse,
    AutoevaluacionTrimestralResponse,
    CalificacionSerResponse,
    ConsolidadoEstudianteResponse,
    Dimension,
    GestionAcademicaResponse,
    PeriodoEvaluacionResponse,
    PESOS_FIJOS,
} from '@/core/models/sia.models';

interface EstudianteItem {
    id: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    nota?: number;
    observacion?: string;
}

@Component({
    selector: 'app-calificaciones-periodo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        DialogModule,
        InputNumberModule,
        InputTextModule,
        SelectModule,
        TableModule,
        TagModule,
        TextareaModule,
        ToastModule,
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        
        <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <!-- Header -->
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-semibold text-slate-800 dark:text-slate-100">Calificaciones por Periodo</h1>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        SER ({{ PESOS.SER }}pts) | SABER ({{ PESOS.SABER }}pts) | HACER ({{ PESOS.HACER }}pts) | AUTO ({{ PESOS.AUTO }}pts) | Mín. aprobación: 51
                    </p>
                </div>
            </div>

            <!-- Selection Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <p-card>
                    <ng-template pTemplate="header"><span class="text-sm font-medium px-3 py-2 bg-slate-100 dark:bg-slate-800">Gestión Académica</span></ng-template>
                    <div class="py-2">
                        <p-select [options]="gestiones()" [(ngModel)]="selectedGestionId" (ngModelChange)="onGestionChange()" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full" />
                    </div>
                </p-card>
                <p-card>
                    <ng-template pTemplate="header"><span class="text-sm font-medium px-3 py-2 bg-slate-100 dark:bg-slate-800">Periodo</span></ng-template>
                    <div class="py-2">
                        <p-select [options]="periodos()" [(ngModel)]="selectedPeriodoId" (ngModelChange)="onPeriodoChange()" optionLabel="numeroPeriodo" optionValue="id" placeholder="Seleccionar" class="w-full">
                            <ng-template let-p pTemplate="item">{{ p.numeroPeriodo }}° ({{ p.tipoPeriodo }})</ng-template>
                        </p-select>
                    </div>
                </p-card>
                <p-card>
                    <ng-template pTemplate="header"><span class="text-sm font-medium px-3 py-2 bg-slate-100 dark:bg-slate-800">Curso</span></ng-template>
                    <div class="py-2">
                        <p-select [options]="cursos()" [(ngModel)]="selectedCursoId" (ngModelChange)="onCursoChange()" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full" />
                    </div>
                </p-card>
                <p-card>
                    <ng-template pTemplate="header"><span class="text-sm font-medium px-3 py-2 bg-slate-100 dark:bg-slate-800">Paralelo</span></ng-template>
                    <div class="py-2">
                        <p-select [options]="paralelos()" [(ngModel)]="selectedParaleloId" (ngModelChange)="onParaleloChange()" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full" />
                    </div>
                </p-card>
            </div>

            <!-- Materia Row -->
            <div class="mb-6">
                <p-card>
                    <ng-template pTemplate="header"><span class="text-sm font-medium px-3 py-2 bg-slate-100 dark:bg-slate-800">Materia</span></ng-template>
                    <div class="py-2">
                        <p-select [options]="materias()" [(ngModel)]="selectedMateriaId" (ngModelChange)="onMateriaChange()" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" class="w-full" />
                    </div>
                </p-card>
            </div>

            <!-- Active Section Selector -->
            <div *ngIf="selectedPeriodoId && selectedMateriaId && estudiantes().length > 0" class="flex gap-2 mb-4 flex-wrap">
                <p-button [label]="'SABER (' + actividadesSaber().length + ')'" [outlined]="seccionActiva !== 'SABER'" (click)="seccionActiva = 'SABER'; cargarSer();" />
                <p-button [label]="'HACER (' + actividadesHacer().length + ')'" [outlined]="seccionActiva !== 'HACER'" (click)="seccionActiva = 'HACER'" />
                <p-button [label]="'SER'" [outlined]="seccionActiva !== 'SER'" (click)="seccionActiva = 'SER'; cargarSer();" />
                <p-button [label]="'AUTO'" [outlined]="seccionActiva !== 'AUTO'" (click)="seccionActiva = 'AUTO'; cargarAuto();" />
                <p-button [label]="'CONSOLIDADO'" [outlined]="seccionActiva !== 'CONSOLIDADO'" (click)="seccionActiva = 'CONSOLIDADO'; cargarConsolidado();" />
            </div>

            <!-- SABER Section -->
            <p-card *ngIf="seccionActiva === 'SABER' && selectedPeriodoId && selectedMateriaId">
                <ng-template pTemplate="header">
                    <div class="flex justify-between items-center px-4 py-3">
                        <span class="font-medium">Actividades SABER - Teoría (Puntaje: {{ PESOS.SABER }} pts)</span>
                        <p-button label="Nueva Actividad" icon="pi pi-plus" size="small" (click)="openActividadDialog('SABER')" />
                    </div>
                </ng-template>
                <p-table [value]="actividadesSaber()" responsiveLayout="scroll" [loading]="loading" stripedRows>
                    <ng-template pTemplate="header">
                        <tr><th>Nombre</th><th>Fecha</th><th>Puntaje</th><th>Estado</th><th style="width:120px">Acciones</th></tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-a>
                        <tr>
                            <td>{{ a.nombreActividad }}</td>
                            <td>{{ a.fechaActividad | date:'dd/MM/yyyy' }}</td>
                            <td>{{ a.puntajeMaximo }}</td>
                            <td><p-tag [value]="a.estado" [severity]="getSeverity(a.estado)" /></td>
                            <td>
                                <p-button icon="pi pi-pencil" [text]="true" pRipple (click)="openActividadDialog('SABER', a)" />
                                <p-button icon="pi pi-trash" [text]="true" severity="danger" (click)="eliminarActividad(a)" />
                                <p-button icon="pi pi-book" [text]="true" (click)="abrirCalificaciones(a)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="5" class="text-center py-6 text-slate-400">Sin actividades SABER. Click en "Nueva Actividad" para crear.</td></tr>
                    </ng-template>
                </p-table>
            </p-card>

            <!-- HACER Section -->
            <p-card *ngIf="seccionActiva === 'HACER' && selectedPeriodoId && selectedMateriaId">
                <ng-template pTemplate="header">
                    <div class="flex justify-between items-center px-4 py-3">
                        <span class="font-medium">Actividades HACER - Práctica (Puntaje: {{ PESOS.HACER }} pts)</span>
                        <p-button label="Nueva Actividad" icon="pi pi-plus" size="small" (click)="openActividadDialog('HACER')" />
                    </div>
                </ng-template>
                <p-table [value]="actividadesHacer()" responsiveLayout="scroll" [loading]="loading" stripedRows>
                    <ng-template pTemplate="header">
                        <tr><th>Nombre</th><th>Fecha</th><th>Puntaje</th><th>Estado</th><th style="width:120px">Acciones</th></tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-a>
                        <tr>
                            <td>{{ a.nombreActividad }}</td>
                            <td>{{ a.fechaActividad | date:'dd/MM/yyyy' }}</td>
                            <td>{{ a.puntajeMaximo }}</td>
                            <td><p-tag [value]="a.estado" [severity]="getSeverity(a.estado)" /></td>
                            <td>
                                <p-button icon="pi pi-pencil" [text]="true" (click)="openActividadDialog('HACER', a)" />
                                <p-button icon="pi pi-trash" [text]="true" severity="danger" (click)="eliminarActividad(a)" />
                                <p-button icon="pi pi-book" [text]="true" (click)="abrirCalificaciones(a)" />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="5" class="text-center py-6 text-slate-400">Sin actividades HACER. Click en "Nueva Actividad" para crear.</td></tr>
                    </ng-template>
                </p-table>
            </p-card>

            <!-- SER Section -->
            <p-card *ngIf="seccionActiva === 'SER' && selectedPeriodoId && selectedMateriaId">
                <ng-template pTemplate="header">
                    <div class="px-4 py-3"><span class="font-medium">SER - Observación Global (Puntaje: {{ PESOS.SER }} pts)</span></div>
                </ng-template>
                <div class="space-y-4">
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded p-4 text-sm text-blue-700 dark:text-blue-300">
                        El docente registra una observación global del estudiante al final del periodo.
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm mb-1">Estudiante</label>
                            <p-select [options]="estudiantes()" [(ngModel)]="serForm.idEstudiante" optionLabel="nombreCompleto" optionValue="id" placeholder="Seleccionar" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nota (0-{{ PESOS.SER }})</label>
                            <p-inputNumber [(ngModel)]="serForm.notaSer" [min]="0" [max]="PESOS.SER" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Observación</label>
                            <input pInputText [(ngModel)]="serForm.observacionFinal" class="w-full" />
                        </div>
                    </div>
                    <p-button label="Guardar SER" icon="pi pi-check" (click)="guardarSer()" [loading]="savingSer" />
                    <p-table [value]="serRegistrados()" responsiveLayout="scroll" stripedRows>
                        <ng-template pTemplate="header"><tr><th>Estudiante</th><th>Nota</th><th>Obs.</th><th>Acciones</th></tr></ng-template>
                        <ng-template pTemplate="body" let-s>
                            <tr><td>{{ s.idEstudiante }}</td><td>{{ s.notaSer }}</td><td>{{ s.observacionFinal }}</td><td><p-button icon="pi pi-pencil" [text]="true" (click)="editarSer(s)" /></td></tr>
                        </ng-template>
                    </p-table>
                </div>
            </p-card>

<!-- AUTO Section -->
            <p-card *ngIf="seccionActiva === 'AUTO' && selectedPeriodoId && selectedMateriaId">
                <ng-template pTemplate="header">
                    <div class="px-4 py-3"><span class="font-medium">AUTOEVALUACIÓN - Estudiante (Puntaje: {{ PESOS.AUTO }} pts)</span></div>
                </ng-template>
                <div class="space-y-4">
                    <div class="bg-green-50 dark:bg-green-900/20 rounded p-4 text-sm text-green-700 dark:text-green-300">
                        El estudiante se califica a sí mismo sobre su desempeño.
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm mb-1">Estudiante</label>
                            <p-select [options]="estudiantes()" [(ngModel)]="autoForm.idEstudiante" optionLabel="nombreCompleto" optionValue="id" placeholder="Seleccionar" class="w-full" />
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Nota (0-{{ PESOS.AUTO }})</label>
                            <p-inputNumber [(ngModel)]="autoForm.notaAutoevaluacion" [min]="0" [max]="PESOS.AUTO" class="w-full" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Comentario</label>
                        <textarea pInputTextarea [(ngModel)]="autoForm.comentario" rows="2" class="w-full"></textarea>
                    </div>
                    <p-button label="Guardar Autoevaluación" icon="pi pi-check" (click)="guardarAuto()" [loading]="savingAuto" />

                    <p-table [value]="autoRegistrados()" responsiveLayout="scroll" stripedRows>
                        <ng-template pTemplate="header"><tr><th>Estudiante</th><th>Nota</th><th>Comentario</th><th>Acciones</th></tr></ng-template>
                        <ng-template pTemplate="body" let-a>
                            <tr><td>{{ a.idEstudiante }}</td><td>{{ a.notaAutoevaluacion }}</td><td>{{ a.comentario }}</td><td><p-button icon="pi pi-pencil" [text]="true" (click)="editarAuto(a)" /></td></tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage"><tr><td colspan="4" class="text-center py-4 text-slate-400">Sin autoevaluaciones registradas</td></tr></ng-template>
                    </p-table>
                </div>
            </p-card>

            <!-- CONSOLIDADO Section -->
            <p-card *ngIf="seccionActiva === 'CONSOLIDADO' && selectedPeriodoId && selectedMateriaId">
                <ng-template pTemplate="header">
                    <div class="px-4 py-3"><span class="font-medium">CONSOLIDADO - Resumen Final</span></div>
                </ng-template>
                <p-table [value]="consolidado()" responsiveLayout="scroll" [loading]="loadingConsolidado" stripedRows>
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Estudiante</th>
                            <th class="text-center">SABER</th>
                            <th class="text-center">HACER</th>
                            <th class="text-center">SER</th>
                            <th class="text-center">AUTO</th>
                            <th class="text-center">TOTAL</th>
                            <th class="text-center">Estado</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-c>
                        <tr>
                            <td>{{ c.nombreEstudiante }}</td>
                            <td class="text-center">{{ c.saber | number:'1.2-2' }}</td>
                            <td class="text-center">{{ c.hacer | number:'1.2-2' }}</td>
                            <td class="text-center">{{ c.ser | number:'1.2-2' }}</td>
                            <td class="text-center">{{ c.autoevaluacion | number:'1.2-2' }}</td>
                            <td class="text-center font-bold">{{ c.total | number:'1.2-2' }}</td>
                            <td class="text-center"><p-tag [value]="c.estado" [severity]="c.aprobado ? 'success' : 'danger'" /></td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr><td colspan="7" class="text-center py-6 text-slate-400">Sin datos consolidados</td></tr>
                    </ng-template>
                </p-table>
            </p-card>

            <!-- Empty State -->
            <div *ngIf="!selectedPeriodoId || !selectedMateriaId" class="text-center py-16 text-slate-400">
                <i class="pi pi-calendar text-5xl mb-4 block"></i>
                <p class="text-lg">Seleccione gestión, periodo y materia para comenzar</p>
            </div>
        </div>

        <!-- Actividad Dialog -->
        <p-dialog [(visible)]="dlgActividad" [header]="editandoActividad ? 'Editar Actividad' : 'Nueva Actividad'" [modal]="true" [style]="{width:'450px'}">
            <div class="space-y-3">
                <div>
                    <label class="block text-sm mb-1">Nombre</label>
                    <input pInputText [(ngModel)]="actividadForm.nombreActividad" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm mb-1">Fecha</label>
                    <input pInputText [(ngModel)]="actividadForm.fechaActividad" type="date" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm mb-1">Puntaje máximo (sobre 100)</label>
                    <p-inputNumber [(ngModel)]="actividadForm.puntajeMaximo" [min]="1" [max]="100" class="w-full" />
                </div>
                <div>
                    <label class="block text-sm mb-1">Descripción / Criterio de evaluación</label>
                    <textarea pInputTextarea [(ngModel)]="actividadForm.descripcionEvidencia" rows="2" class="w-full"></textarea>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" [text]="true" (click)="dlgActividad=false" />
                <p-button label="Guardar" icon="pi pi-check" (click)="guardarActividad()" [loading]="savingActividad" />
            </ng-template>
        </p-dialog>

        <!-- Calificaciones Dialog -->
        <p-dialog [(visible)]="dlgCalificaciones" header="Calificar Actividad" [modal]="true" [style]="{width:'600px'}">
            <p-table [value]="estCalificar()" responsiveLayout="scroll" [loading]="loadingCal" stripedRows>
                <ng-template pTemplate="header"><tr><th>Estudiante</th><th>Nota (0-{{ actividadMax }})</th><th>Observación</th></tr></ng-template>
                <ng-template pTemplate="body" let-e>
                    <tr>
                        <td>{{ e.nombreCompleto }}</td>
                        <td><p-inputNumber [(ngModel)]="e.nota" [min]="0" [max]="actividadMax" class="w-full" /></td>
                        <td><input pInputText [(ngModel)]="e.observacion" class="w-full" /></td>
                    </tr>
                </ng-template>
            </p-table>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" [text]="true" (click)="dlgCalificaciones=false" />
                <p-button label="Guardar Todas" icon="pi pi-check" (click)="guardarCalificaciones()" [loading]="savingCal" />
            </ng-template>
        </p-dialog>
    `,
    styles: []
})
export class CalificacionesPeriodoComponent implements OnInit {
    private readonly calSvc = inject(CalificacionService);
    private readonly siaSvc = inject(SiaService);
    private readonly msg = inject(MessageService);

    readonly PESOS = PESOS_FIJOS;

    gestiones = signal<GestionAcademicaResponse[]>([]);
    periodos = signal<PeriodoEvaluacionResponse[]>([]);
    cursos = signal<any[]>([]);
    paralelos = signal<any[]>([]);
    materias = signal<any[]>([]);
    estudiantes = signal<EstudianteItem[]>([]);
    actividadesSaber = signal<ActividadEvaluativaResponse[]>([]);
    actividadesHacer = signal<ActividadEvaluativaResponse[]>([]);
    serRegistrados = signal<CalificacionSerResponse[]>([]);
    autoRegistrados = signal<AutoevaluacionTrimestralResponse[]>([]);
    consolidado = signal<any[]>([]);

    selectedGestionId = '';
    selectedPeriodoId = '';
    selectedCursoId = '';
    selectedParaleloId = '';
    selectedMateriaId = '';
    seccionActiva: 'SABER' | 'HACER' | 'SER' | 'AUTO' | 'CONSOLIDADO' = 'SABER';

    loading = false;
    loadingConsolidado = false;
    loadingCal = false;
    savingActividad = false;
    savingSer = false;
    savingAuto = false;
    savingCal = false;

    dlgActividad = false;
    dlgCalificaciones = false;
    editandoActividad: ActividadEvaluativaResponse | null = null;
    actividadMax = 100;

    actividadForm: ActividadEvaluativaRequest = this.nuevaActividad();
    serForm: { idEstudiante: string; idMateria: string; notaSer: number; observacionFinal: string } = { idEstudiante: '', idMateria: '', notaSer: 0, observacionFinal: '' };
    autoForm: { idEstudiante: string; idMateria: string; notaAutoevaluacion: number; comentario: string } = { idEstudiante: '', idMateria: '', notaAutoevaluacion: 0, comentario: '' };
    estCalificar = signal<EstudianteItem[]>([]);
    actividadSeleccionadaId = '';

    ngOnInit() {
        this.cargarGestiones();
    }

    cargarGestiones() {
        this.siaSvc.listarGestiones().subscribe({ next: (r) => { if (r.codigo === 200) { this.gestiones.set(r.data); const a = r.data.find((g: any) => g.activa); if (a) { this.selectedGestionId = a.id; this.onGestionChange(); } } } });
    }

    onGestionChange() {
        this.selectedPeriodoId = '';
        this.selectedCursoId = '';
        this.selectedParaleloId = '';
        this.selectedMateriaId = '';
        this.cursos.set([]);
        this.paralelos.set([]);
        this.materias.set([]);
        this.estudiantes.set([]);
        this.actividadesSaber.set([]);
        this.actividadesHacer.set([]);
        this.serRegistrados.set([]);
        this.autoRegistrados.set([]);
        this.consolidado.set([]);
        if (this.selectedGestionId) {
            this.calSvc.listarPeriodosGestion(this.selectedGestionId).subscribe({ next: (r) => { if (r.codigo === 200) { this.periodos.set(r.data); if (r.data.length) { this.selectedPeriodoId = r.data[0].id; this.cargarCursos(); } } } });
        }
    }

    onPeriodoChange() {
        if (this.selectedPeriodoId) {
            this.cargarCursos();
        }
    }

    cargarCursos() {
        this.siaSvc.listarCursos().subscribe({ next: (r) => { if (r.codigo === 200) { this.cursos.set(r.data); if (r.data.length) { this.selectedCursoId = r.data[0].id; this.cargarParalelos(); } } } });
    }

    onCursoChange() {
        if (this.selectedCursoId) {
            this.cargarParalelos();
        }
    }

    cargarParalelos() {
        this.siaSvc.listarParalelos().subscribe({ next: (r) => { if (r.codigo === 200) { this.paralelos.set(r.data); if (r.data.length) { this.selectedParaleloId = r.data[0].id; this.cargarMaterias(); } } } });
    }

    onParaleloChange() {
        if (this.selectedParaleloId) {
            this.cargarMaterias();
        }
    }

    cargarMaterias() {
        this.siaSvc.listarMaterias().subscribe({ next: (r) => { if (r.codigo === 200) { this.materias.set(r.data); if (r.data.length) { this.selectedMateriaId = r.data[0].id; this.onLoadData(); } } } });
    }

    onLoadData() { this.cargarActividades(); this.cargarConsolidado(); this.cargarEstudiantes(); }

    cargarActividades() {
        if (!this.selectedPeriodoId || !this.selectedMateriaId) return;
        this.loading = true;
        this.calSvc.listarActividadesPorPeriodo(this.selectedPeriodoId).subscribe({
            next: (r) => { if (r.codigo === 200) { this.actividadesSaber.set(r.data.filter((a: any) => a.dimension === 'SABER')); this.actividadesHacer.set(r.data.filter((a: any) => a.dimension === 'HACER')); } this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    cargarEstudiantes() {
        if (!this.selectedCursoId || !this.selectedParaleloId) return;
        this.siaSvc.listarEstudiantesPorCursoParalelo(this.selectedCursoId, this.selectedParaleloId).subscribe({
            next: (r: any) => { if (r.codigo === 200) { this.estudiantes.set(r.data.map((e: any) => ({ ...e, nombreCompleto: `${e.nombres} ${e.apellidos}` }))); } },
            error: () => { }
        });
    }

    cargarConsolidado() {
        if (!this.selectedPeriodoId || !this.selectedMateriaId) return;
        this.loadingConsolidado = true;
        this.calSvc.obtenerConsolidadoEstudiante(this.selectedPeriodoId, '', this.selectedMateriaId).subscribe({
            next: (r) => { if (r.codigo === 200) { this.consolidado.set([r.data].filter(Boolean)); } this.loadingConsolidado = false; },
            error: () => { this.loadingConsolidado = false; }
        });
    }

    onMateriaChange() { this.onLoadData(); }

    nuevaActividad(): ActividadEvaluativaRequest { return { idMateria: this.selectedMateriaId, idDocente: '', nombreActividad: '', dimension: 'SABER', fechaActividad: new Date().toISOString().split('T')[0], descripcionEvidencia: '', puntajeMaximo: 100, estado: 'BORRADOR' }; }

    openActividadDialog(dim: Dimension, act?: ActividadEvaluativaResponse) {
        this.editandoActividad = act || null;
        if (act) {
            this.actividadForm = { idMateria: act.idMateria, idDocente: act.idDocente, nombreActividad: act.nombreActividad, dimension: act.dimension as Dimension, fechaActividad: act.fechaActividad, descripcionEvidencia: act.descripcionEvidencia || '', puntajeMaximo: act.puntajeMaximo, estado: act.estado };
            this.actividadMax = act.puntajeMaximo;
        } else {
            this.actividadForm = this.nuevaActividad(); this.actividadForm.dimension = dim; this.actividadMax = 100;
        }
        this.dlgActividad = true;
    }

    guardarActividad() {
        if (!this.selectedPeriodoId) return;
        this.savingActividad = true;
        this.actividadForm.idMateria = this.selectedMateriaId;
        const obs = this.editandoActividad
            ? this.calSvc.actualizarActividadPeriodo(this.selectedPeriodoId, this.editandoActividad.id, this.actividadForm)
            : this.calSvc.crearActividadPeriodo(this.selectedPeriodoId, this.actividadForm);
        obs.subscribe({ next: (r) => { if (r.codigo === 200 || r.codigo === 201) { this.msg.add({ severity: 'success', summary: 'OK', detail: 'Actividad guardada' }); this.cargarActividades(); } this.dlgActividad = false; this.savingActividad = false; }, error: () => { this.savingActividad = false; } });
    }

    eliminarActividad(act: ActividadEvaluativaResponse) {
        if (!this.selectedPeriodoId) return;
        this.calSvc.eliminarActividadPeriodo(this.selectedPeriodoId, act.id).subscribe({ next: (r) => { if (r.codigo === 200) { this.msg.add({ severity: 'success', summary: 'OK', detail: 'Eliminada' }); this.cargarActividades(); } } });
    }

    abrirCalificaciones(act: ActividadEvaluativaResponse) {
        this.actividadSeleccionadaId = act.id;
        this.actividadMax = act.puntajeMaximo;
        this.loadingCal = true;
        this.dlgCalificaciones = true;
        this.calSvc.listarCalificacionesActividad(this.selectedPeriodoId, act.id).subscribe({
            next: (r) => {
                if (r.codigo === 200) {
                    this.estCalificar.set(this.estudiantes().map(e => { const c = r.data.find((x: any) => x.idEstudiante === e.id); return { ...e, nota: c?.notaObtenida || 0, observacion: c?.observacion || '' }; }));
                }
                this.loadingCal = false;
            },
            error: () => { this.loadingCal = false; }
        });
    }

    guardarCalificaciones() {
        if (!this.selectedPeriodoId) return;
        this.savingCal = true;
        this.calSvc.guardarCalificacionesActividad(this.selectedPeriodoId, { idActividad: this.actividadSeleccionadaId, detalles: this.estCalificar().map(e => ({ idEstudiante: e.id, notaObtenida: e.nota, observacion: e.observacion })) }).subscribe({
            next: (r) => { if (r.codigo === 201) { this.msg.add({ severity: 'success', summary: 'OK', detail: 'Calificaciones guardadas' }); this.cargarActividades(); } this.dlgCalificaciones = false; this.savingCal = false; },
            error: () => { this.savingCal = false; }
        });
    }

    guardarSer() {
        if (!this.selectedPeriodoId || !this.serForm.idEstudiante) return;
        this.savingSer = true;
        this.serForm.idMateria = this.selectedMateriaId;
        this.calSvc.guardarSerPeriodo(this.selectedPeriodoId, this.serForm as any).subscribe({
            next: (r) => { if (r.codigo === 201) { this.msg.add({ severity: 'success', summary: 'OK', detail: 'SER guardado' }); this.serForm = { idEstudiante: '', idMateria: '', notaSer: 0, observacionFinal: '' }; this.cargarSer(); } this.savingSer = false; },
            error: () => { this.savingSer = false; }
        });
    }

    cargarSer() {
        this.calSvc.obtenerSerPeriodo(this.selectedPeriodoId, '', this.selectedMateriaId).subscribe({ next: (r) => { if (r.codigo === 200 && r.data) this.serRegistrados.set([r.data]); } });
    }

    editarSer(s: CalificacionSerResponse) { this.serForm = { idEstudiante: s.idEstudiante, idMateria: s.idMateria, notaSer: Number(s.notaSer), observacionFinal: s.observacionFinal || '' }; }

    guardarAuto() {
        if (!this.selectedPeriodoId || !this.autoForm.idEstudiante) return;
        this.savingAuto = true;
        this.autoForm.idMateria = this.selectedMateriaId;
        this.calSvc.guardarAutoevaluacionPeriodo(this.selectedPeriodoId, this.autoForm as any).subscribe({
            next: (r) => { if (r.codigo === 201) { this.msg.add({ severity: 'success', summary: 'OK', detail: 'Autoevaluación guardada' }); this.autoForm = { idEstudiante: '', idMateria: '', notaAutoevaluacion: 0, comentario: '' }; this.cargarAuto(); } this.savingAuto = false; },
            error: () => { this.savingAuto = false; }
        });
    }

    cargarAuto() {
        if (!this.selectedPeriodoId || !this.selectedMateriaId) return;
        this.calSvc.obtenerAutoevaluacionPeriodo(this.selectedPeriodoId, '', this.selectedMateriaId).subscribe({ next: (r) => { if (r.codigo === 200 && r.data) this.autoRegistrados.set([r.data]); } });
    }

    editarAuto(a: AutoevaluacionTrimestralResponse) {
        this.autoForm = { idEstudiante: a.idEstudiante, idMateria: a.idMateria, notaAutoevaluacion: Number(a.notaAutoevaluacion), comentario: a.comentario || '' };
    }

    getSeverity(s: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined { return s === 'PUBLICADA' ? 'success' : s === 'BORRADOR' ? 'warn' : 'info'; }
}