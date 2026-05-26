import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ReporteService } from '../../../core/services/reporte.service';
import { SiaService } from '../../../core/services/sia.service';
import { GestionAcademicaResponse, ParaleloResponse, CursoResponse } from '../../../core/models/sia.models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    Select,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex flex-col gap-4 p-4">
      <div>
        <h2 class="text-2xl font-semibold text-surface-800 dark:text-surface-100">Reportes</h2>
        <p class="text-surface-500 text-sm mt-1">Asistencia, calificaciones, inscripciones y resumen gerencial</p>
      </div>

      <!-- FILTROS COMUNES -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Gestión *</label>
            <p-select
              [options]="gestiones()"
              [(ngModel)]="idGestionSel"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Seleccione gestión"
              styleClass="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Paralelo (opcional)</label>
            <p-select
              [options]="paralelos()"
              [(ngModel)]="idParaleloSel"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Todos los paralelos"
              [showClear]="true"
              styleClass="w-full"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Curso (para inscripciones)</label>
            <p-select
              [options]="cursos()"
              [(ngModel)]="idCursoSel"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Todos los cursos"
              [showClear]="true"
              styleClass="w-full"
            />
          </div>
        </div>
      </div>

      <!-- PESTAÑAS DE REPORTES -->
      <p-tabs value="asistencia">
        <p-tablist>
          <p-tab value="asistencia">Asistencia</p-tab>
          <p-tab value="calificaciones">Calificaciones</p-tab>
          <p-tab value="inscripciones">Inscripciones</p-tab>
          <p-tab value="gerencial">Gerencial</p-tab>
        </p-tablist>
        <p-tabpanels>
          <!-- ASISTENCIA -->
          <p-tabpanel value="asistencia">
            <div class="flex justify-end mb-3">
              <p-button
                label="Generar"
                icon="pi pi-play"
                [disabled]="!idGestionSel"
                [loading]="cargandoAsistencia()"
                (onClick)="generarAsistencia()"
              />
            </div>
            <p-table [value]="datosAsistencia()" [paginator]="true" [rows]="15" styleClass="p-datatable-sm"
                     [loading]="cargandoAsistencia()">
              <ng-template pTemplate="header">
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Materia</th>
                  <th>Paralelo</th>
                  <th>Total Sesiones</th>
                  <th>Presentes</th>
                  <th>Tardanzas</th>
                  <th>Ausentes</th>
                  <th>% Asistencia</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-r>
                <tr>
                  <td>{{ r['codigo_estudiante'] }}</td>
                  <td>{{ r['nombre'] }} {{ r['apellido'] }}</td>
                  <td>{{ r['materia'] }}</td>
                  <td>{{ r['paralelo'] }}</td>
                  <td>{{ r['total_registros'] }}</td>
                  <td>{{ r['presentes'] }}</td>
                  <td>{{ r['tardanzas'] }}</td>
                  <td>{{ r['ausentes'] }}</td>
                  <td>
                    <span [class]="pctClass(r['porcentaje_asistencia'])">
                      {{ r['porcentaje_asistencia'] }}%
                    </span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="9" class="text-center text-surface-400 py-4">Seleccione una gestión y genere el reporte</td></tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- CALIFICACIONES -->
          <p-tabpanel value="calificaciones">
            <div class="flex justify-end mb-3">
              <p-button
                label="Generar"
                icon="pi pi-play"
                [disabled]="!idGestionSel"
                [loading]="cargandoCalificaciones()"
                (onClick)="generarCalificaciones()"
              />
            </div>
            <p-table [value]="datosCalificaciones()" [paginator]="true" [rows]="15" styleClass="p-datatable-sm"
                     [loading]="cargandoCalificaciones()">
              <ng-template pTemplate="header">
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Materia</th>
                  <th>Paralelo</th>
                  <th>Tipo Evaluación</th>
                  <th>Evaluación</th>
                  <th>Nota Máx.</th>
                  <th>Nota</th>
                  <th>Resultado</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-r>
                <tr>
                  <td>{{ r['codigo_estudiante'] }}</td>
                  <td>{{ r['nombre'] }} {{ r['apellido'] }}</td>
                  <td>{{ r['materia'] }}</td>
                  <td>{{ r['paralelo'] }}</td>
                  <td>{{ r['tipo_evaluacion'] }}</td>
                  <td>{{ r['evaluacion'] }}</td>
                  <td>{{ r['nota_maxima'] }}</td>
                  <td>{{ r['nota_obtenida'] }}</td>
                  <td>
                    <span [class]="r['resultado'] === 'Aprobado' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                      {{ r['resultado'] }}
                    </span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="9" class="text-center text-surface-400 py-4">Seleccione una gestión y genere el reporte</td></tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- INSCRIPCIONES -->
          <p-tabpanel value="inscripciones">
            <div class="flex justify-end mb-3">
              <p-button
                label="Generar"
                icon="pi pi-play"
                [disabled]="!idGestionSel"
                [loading]="cargandoInscripciones()"
                (onClick)="generarInscripciones()"
              />
            </div>
            <p-table [value]="datosInscripciones()" [paginator]="true" [rows]="15" styleClass="p-datatable-sm"
                     [loading]="cargandoInscripciones()">
              <ng-template pTemplate="header">
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Paralelo</th>
                  <th>Gestión</th>
                  <th>Estado</th>
                  <th>Fecha Inscripción</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-r>
                <tr>
                  <td>{{ r['codigo_estudiante'] }}</td>
                  <td>{{ r['nombre'] }} {{ r['apellido'] }}</td>
                  <td>{{ r['curso'] }}</td>
                  <td>{{ r['paralelo'] }}</td>
                  <td>{{ r['gestion'] }}</td>
                  <td>{{ r['estado_inscripcion'] }}</td>
                  <td>{{ r['fecha_inscripcion'] | date:'dd/MM/yyyy' }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr><td colspan="7" class="text-center text-surface-400 py-4">Seleccione una gestión y genere el reporte</td></tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- GERENCIAL -->
          <p-tabpanel value="gerencial">
            <div class="flex justify-end mb-3">
              <p-button
                label="Generar"
                icon="pi pi-play"
                [disabled]="!idGestionSel"
                [loading]="cargandoGerencial()"
                (onClick)="generarGerencial()"
              />
            </div>
            @if (resumenGerencial()) {
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <p-card>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-primary">{{ resumenGerencial()!['totalEstudiantes'] }}</div>
                    <div class="text-surface-500 text-sm mt-1">Estudiantes inscritos</div>
                  </div>
                </p-card>
                <p-card>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-primary">{{ resumenGerencial()!['totalDocentes'] }}</div>
                    <div class="text-surface-500 text-sm mt-1">Docentes asignados</div>
                  </div>
                </p-card>
                <p-card>
                  <div class="text-center">
                    <div class="text-3xl font-bold text-primary">{{ resumenGerencial()!['totalSesiones'] }}</div>
                    <div class="text-surface-500 text-sm mt-1">Sesiones de clase</div>
                  </div>
                </p-card>
                <p-card>
                  <div class="text-center">
                    <div class="text-3xl font-bold"
                      [class]="(+resumenGerencial()!['promedioAsistencia']! >= 75) ? 'text-green-600' : 'text-red-500'">
                      {{ resumenGerencial()!['promedioAsistencia'] }}%
                    </div>
                    <div class="text-surface-500 text-sm mt-1">Prom. asistencia</div>
                  </div>
                </p-card>
              </div>
            }
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private reporteSvc = inject(ReporteService);
  private siaSvc = inject(SiaService);
  private toast = inject(MessageService);

  gestiones = signal<GestionAcademicaResponse[]>([]);
  paralelos = signal<ParaleloResponse[]>([]);
  cursos = signal<CursoResponse[]>([]);

  idGestionSel: string | null = null;
  idParaleloSel: string | null = null;
  idCursoSel: string | null = null;

  datosAsistencia = signal<Record<string, unknown>[]>([]);
  datosCalificaciones = signal<Record<string, unknown>[]>([]);
  datosInscripciones = signal<Record<string, unknown>[]>([]);
  resumenGerencial = signal<Record<string, unknown> | null>(null);

  cargandoAsistencia = signal(false);
  cargandoCalificaciones = signal(false);
  cargandoInscripciones = signal(false);
  cargandoGerencial = signal(false);

  ngOnInit(): void {
    this.siaSvc.listarGestiones().subscribe(r => { if (r?.codigo === 200) this.gestiones.set(r.data ?? []); });
    this.siaSvc.listarParalelos().subscribe(r => { if (r?.codigo === 200) this.paralelos.set(r.data ?? []); });
    this.siaSvc.listarCursos().subscribe(r => { if (r?.codigo === 200) this.cursos.set(r.data ?? []); });
  }

  generarAsistencia(): void {
    if (!this.idGestionSel) return;
    this.cargandoAsistencia.set(true);
    this.reporteSvc.reporteAsistencia(this.idGestionSel, this.idParaleloSel ?? undefined).subscribe({
      next: r => { if (r?.codigo === 200) this.datosAsistencia.set(r.data ?? []); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de asistencia' }),
      complete: () => this.cargandoAsistencia.set(false)
    });
  }

  generarCalificaciones(): void {
    if (!this.idGestionSel) return;
    this.cargandoCalificaciones.set(true);
    this.reporteSvc.reporteCalificaciones(this.idGestionSel, this.idParaleloSel ?? undefined).subscribe({
      next: r => { if (r?.codigo === 200) this.datosCalificaciones.set(r.data ?? []); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de calificaciones' }),
      complete: () => this.cargandoCalificaciones.set(false)
    });
  }

  generarInscripciones(): void {
    if (!this.idGestionSel) return;
    this.cargandoInscripciones.set(true);
    this.reporteSvc.reporteInscripciones(this.idGestionSel, this.idCursoSel ?? undefined).subscribe({
      next: r => { if (r?.codigo === 200) this.datosInscripciones.set(r.data ?? []); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de inscripciones' }),
      complete: () => this.cargandoInscripciones.set(false)
    });
  }

  generarGerencial(): void {
    if (!this.idGestionSel) return;
    this.cargandoGerencial.set(true);
    this.reporteSvc.reporteGerencial(this.idGestionSel).subscribe({
      next: r => { if (r?.codigo === 200) this.resumenGerencial.set(r.data ?? null); },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte gerencial' }),
      complete: () => this.cargandoGerencial.set(false)
    });
  }

  pctClass(pct: unknown): string {
    const n = Number(pct);
    if (isNaN(n)) return '';
    return n >= 75 ? 'text-green-600 font-medium' : 'text-red-500 font-medium';
  }
}
