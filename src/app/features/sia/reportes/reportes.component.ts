import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ReporteService, ConsultaNaturalResponse } from './services/reporte.service';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';
import { ParalelosService } from '@/features/sia/paralelos/services/paralelos.service';
import { CursosService } from '@/features/sia/cursos/services/cursos.service';
import { GestionAcademicaResponse, ParaleloResponse, CursoResponse } from '@/core/models/sia.models';

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
    CardModule,
    TextareaModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex flex-col gap-4 p-4">
      <div>
        <h2 class="text-2xl font-semibold text-surface-800 dark:text-surface-100">Reportes</h2>
        <p class="text-surface-500 text-sm mt-1">Asistencia, calificaciones, inscripciones, resumen gerencial y consulta IA</p>
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
          <p-tab value="consulta-ia">
            <span class="flex items-center gap-1">
              <i class="pi pi-sparkles text-purple-500"></i> Consulta IA
            </span>
          </p-tab>
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
          <!-- CONSULTA IA -->
          <p-tabpanel value="consulta-ia">
            <div class="flex flex-col gap-4 pt-2">
              <div class="card">
                <p class="text-sm text-surface-500 mb-3">
                  Escribe una pregunta en lenguaje natural. La IA generará y ejecutará la consulta SQL automáticamente
                  filtrando los datos de tu institución.
                </p>
                <div class="flex flex-col gap-2">
                  <textarea
                    pTextarea
                    rows="3"
                    [(ngModel)]="consultaTexto"
                    placeholder="Ej: ¿Cuántos estudiantes están inscritos en la gestión 2025 por curso?"
                    class="w-full resize-none"
                    [disabled]="cargandoConsulta()"
                  ></textarea>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-surface-400">Máx. {{ limiteFilas }} filas</span>
                    <p-button
                      label="Consultar"
                      icon="pi pi-sparkles"
                      [loading]="cargandoConsulta()"
                      [disabled]="!consultaTexto.trim()"
                      (onClick)="consultarIA()"
                      severity="help"
                    />
                  </div>
                </div>
              </div>

              @if (resultadoConsulta()) {
                <!-- SQL generado (colapsable) -->
                <div class="card">
                  <div
                    class="flex justify-between items-center cursor-pointer select-none"
                    (click)="sqlVisible.set(!sqlVisible())"
                  >
                    <span class="text-sm font-medium text-surface-600">SQL generado</span>
                    <i [class]="sqlVisible() ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-xs"></i>
                  </div>
                  @if (sqlVisible()) {
                    <pre class="mt-2 p-3 bg-surface-100 dark:bg-surface-800 rounded text-xs overflow-x-auto text-surface-700 dark:text-surface-300">{{ resultadoConsulta()!.sqlGenerado }}</pre>
                  }
                </div>

                <!-- Resultados -->
                <div class="card">
                  <p class="text-sm font-medium text-surface-600 mb-2">Resultados ({{ resultadoConsulta()!.total }} filas)</p>
                  @if (resultadoConsulta()!.columnas.length > 0) {
                    <p-table
                      [value]="filasComoObjetos()"
                      [paginator]="true"
                      [rows]="15"
                      styleClass="p-datatable-sm"
                      [scrollable]="true"
                      scrollHeight="420px"
                    >
                      <ng-template pTemplate="header">
                        <tr>
                          @for (col of resultadoConsulta()!.columnas; track col) {
                            <th>{{ col }}</th>
                          }
                        </tr>
                      </ng-template>
                      <ng-template pTemplate="body" let-row>
                        <tr>
                          @for (col of resultadoConsulta()!.columnas; track col) {
                            <td>{{ row[col] }}</td>
                          }
                        </tr>
                      </ng-template>
                      <ng-template pTemplate="emptymessage">
                        <tr><td [attr.colspan]="resultadoConsulta()!.columnas.length" class="text-center text-surface-400 py-4">Sin resultados</td></tr>
                      </ng-template>
                    </p-table>
                  } @else {
                    <p class="text-surface-400 text-sm">La consulta no retornó filas.</p>
                  }
                </div>
              }
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private reporteSvc = inject(ReporteService);
  private gestionesService = inject(GestionesService);
  private paralelosService = inject(ParalelosService);
  private cursosService = inject(CursosService);
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

  // Consulta IA
  consultaTexto = '';
  limiteFilas = 100;
  cargandoConsulta = signal(false);
  resultadoConsulta = signal<ConsultaNaturalResponse | null>(null);
  sqlVisible = signal(false);

  ngOnInit(): void {
    this.gestionesService.listarGestiones().subscribe(r => { if (r?.codigo === 200) this.gestiones.set(r.data ?? []); });
    this.paralelosService.listarParalelos().subscribe(r => { if (r?.codigo === 200) this.paralelos.set(r.data ?? []); });
    this.cursosService.listarCursos().subscribe(r => { if (r?.codigo === 200) this.cursos.set(r.data ?? []); });
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

  consultarIA(): void {
    const texto = this.consultaTexto.trim();
    if (!texto) return;
    this.cargandoConsulta.set(true);
    this.resultadoConsulta.set(null);
    this.sqlVisible.set(false);
    this.reporteSvc.consultaNatural(texto, this.limiteFilas).subscribe({
      next: r => {
        if (r?.codigo === 200 && r.data) {
          this.resultadoConsulta.set(r.data);
          this.sqlVisible.set(true);
        } else {
          this.toast.add({ severity: 'warn', summary: 'Sin resultados', detail: r?.mensaje ?? 'La IA no pudo generar la consulta' });
        }
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error IA', detail: 'No se pudo ejecutar la consulta. Intente reformular la pregunta.' }),
      complete: () => this.cargandoConsulta.set(false)
    });
  }

  /** Convierte las filas (array de arrays) a array de objetos para p-table */
  filasComoObjetos(): Record<string, unknown>[] {
    const res = this.resultadoConsulta();
    if (!res) return [];
    return res.filas.map(fila =>
      Object.fromEntries(res.columnas.map((col, i) => [col, fila[i]]))
    );
  }
}
