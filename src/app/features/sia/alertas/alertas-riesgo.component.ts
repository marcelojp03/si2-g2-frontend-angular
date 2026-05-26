import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import {
  IaService,
  RiesgoEstudianteRequest,
  RiesgoEstudianteResponse,
  InterpretacionIaRequest,
  InterpretacionIaResponse,
} from '../../../core/services/ia.service';
import { SiaService } from '../../../core/services/sia.service';

@Component({
  selector: 'app-alertas-riesgo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ProgressBarModule,
    Select,
    InputTextModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex flex-col gap-6 p-4">

      <!-- ENCABEZADO -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-surface-800 dark:text-surface-100">
            Alertas de Riesgo Académico
          </h2>
          <p class="text-surface-500 text-sm mt-1">
            Predicción IA basada en asistencia, calificaciones e historial
          </p>
        </div>
        <p-button
          label="Analizar Paralelo"
          icon="pi pi-bolt"
          [loading]="cargando()"
          (onClick)="analizarParalelo()"
          [disabled]="!paraleloSeleccionado()"
        />
      </div>

      <!-- FILTROS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-600">Gestión Académica</label>
          <p-select
            [options]="gestiones()"
            [(ngModel)]="idGestionSeleccionada"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar gestión"
            (onChange)="onGestionChange()"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-surface-600">Paralelo</label>
          <p-select
            [options]="paralelos()"
            [(ngModel)]="idParaleloSeleccionado"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar paralelo"
            class="w-full"
          />
        </div>
      </div>

      <!-- TABLA DE RESULTADOS -->
      @if (resultados().length > 0) {
        <div class="card surface-card border-1 surface-border border-round p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Resultados — {{ resultados().length }} estudiantes analizados
            </h3>
            <div class="flex gap-2">
              <span class="text-sm">
                En riesgo alto/crítico:
                <strong class="text-red-600">{{ estudiantesEnRiesgo() }}</strong>
              </span>
            </div>
          </div>

          <p-table
            [value]="resultados()"
            [sortField]="'probabilidad_riesgo'"
            [sortOrder]="-1"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Estudiante</th>
                <th pSortableColumn="nivel_riesgo">Nivel <p-sortIcon field="nivel_riesgo" /></th>
                <th pSortableColumn="probabilidad_riesgo">Probabilidad <p-sortIcon field="probabilidad_riesgo" /></th>
                <th>Factores principales</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-r>
              <tr>
                <td class="font-mono text-sm">{{ r.id_estudiante }}</td>
                <td>
                  <p-tag
                    [value]="r.nivel_riesgo"
                    [severity]="severidadNivel(r.nivel_riesgo)"
                  />
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <p-progressBar
                      [value]="r.probabilidad_riesgo * 100 | number:'1.0-0'"
                      [style]="{ height: '10px', width: '80px' }"
                      [color]="colorBarra(r.nivel_riesgo)"
                    />
                    <span class="text-sm">{{ r.probabilidad_riesgo * 100 | number:'1.0-0' }}%</span>
                  </div>
                </td>
                <td>
                  <ul class="list-disc list-inside text-sm text-surface-600">
                    @for (f of r.factores_principales; track f) {
                      <li>{{ f }}</li>
                    }
                  </ul>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

      <!-- SECCIÓN: CONSULTA EN LENGUAJE NATURAL -->
      <div class="card surface-card border-1 surface-border border-round p-4">
        <h3 class="text-lg font-semibold mb-3">Consulta con IA (lenguaje natural)</h3>
        <p class="text-sm text-surface-500 mb-3">
          Ejemplo: "estudiantes con menos del 60% de asistencia en matemáticas"
        </p>
        <div class="flex gap-2">
          <input
            pInputText
            class="flex-1"
            [(ngModel)]="textoConsulta"
            placeholder="Escribe tu consulta..."
          />
          <p-select
            [options]="entidades"
            [(ngModel)]="entidadSeleccionada"
            placeholder="Entidad"
            class="w-48"
          />
          <p-button
            label="Interpretar"
            icon="pi pi-search"
            [loading]="cargandoNL()"
            (onClick)="interpretarConsulta()"
            [disabled]="!textoConsulta.trim()"
          />
        </div>

        @if (resultadoNL()) {
          <div class="mt-4 p-3 surface-100 border-round">
            <p class="text-sm font-medium mb-2">
              Confianza: {{ resultadoNL()!.confianza * 100 | number:'1.0-0' }}%
            </p>
            <p class="text-xs text-surface-500 mb-2">Filtros detectados:</p>
            <ul class="text-sm space-y-1">
              @for (f of resultadoNL()!.filtros; track f.campo) {
                <li class="font-mono text-xs bg-white px-2 py-1 rounded border">
                  {{ f.campo }} {{ f.operador }} {{ f.valor }}
                </li>
              }
            </ul>
            @if (resultadoNL()!.columnas_sugeridas.length > 0) {
              <p class="text-xs text-surface-500 mt-2">
                Columnas sugeridas: {{ resultadoNL()!.columnas_sugeridas.join(', ') }}
              </p>
            }
          </div>
        }
      </div>

    </div>
  `,
})
export class AlertasRiesgoComponent implements OnInit {
  private iaSvc = inject(IaService);
  private siaSvc = inject(SiaService);
  private msg = inject(MessageService);

  gestiones = signal<{ id: string; nombre: string }[]>([]);
  paralelos = signal<{ id: string; nombre: string }[]>([]);
  resultados = signal<RiesgoEstudianteResponse[]>([]);
  resultadoNL = signal<InterpretacionIaResponse | null>(null);

  cargando = signal(false);
  cargandoNL = signal(false);

  idGestionSeleccionada: string | null = null;
  idParaleloSeleccionado: string | null = null;
  textoConsulta = '';
  entidadSeleccionada: 'asistencia' | 'calificacion' | 'inscripcion' = 'asistencia';

  entidades = [
    { label: 'Asistencia', value: 'asistencia' },
    { label: 'Calificación', value: 'calificacion' },
    { label: 'Inscripción', value: 'inscripcion' },
  ];

  paraleloSeleccionado = computed(() => !!this.idParaleloSeleccionado);

  estudiantesEnRiesgo = computed(
    () => this.resultados().filter(r => r.nivel_riesgo === 'ALTO' || r.nivel_riesgo === 'CRITICO').length
  );

  ngOnInit(): void {
    this.siaSvc.listarGestiones().subscribe({
      next: res => {
        if (res.codigo === 200) this.gestiones.set(res.data as any);
      },
    });
  }

  onGestionChange(): void {
    this.idParaleloSeleccionado = null;
    if (!this.idGestionSeleccionada) return;
    this.siaSvc.listarParalelos().subscribe({
      next: res => {
        if (res.codigo === 200) this.paralelos.set(res.data as any);
      },
    });
  }

  analizarParalelo(): void {
    if (!this.idParaleloSeleccionado) return;
    this.cargando.set(true);

    // Obtiene datos de asistencia + calificaciones del paralelo y construye los inputs de IA
    // Por ahora se usan datos de demostración; integrar con AsistenciaService y CalificacionService en Sprint 4
    const demo: RiesgoEstudianteRequest[] = this.generarDatosDemoParalelo(this.idParaleloSeleccionado);

    this.iaSvc.predecirRiesgo(demo).subscribe({
      next: res => {
        if (res.codigo === 200) {
          this.resultados.set(res.data);
          const enRiesgo = res.data.filter(r => r.nivel_riesgo === 'ALTO' || r.nivel_riesgo === 'CRITICO').length;
          this.msg.add({
            severity: enRiesgo > 0 ? 'warn' : 'success',
            summary: 'Análisis completado',
            detail: `${enRiesgo} estudiante(s) en riesgo alto/crítico`,
          });
        }
        this.cargando.set(false);
      },
      error: err => {
        this.msg.add({ severity: 'error', summary: 'Error IA', detail: err.message });
        this.cargando.set(false);
      },
    });
  }

  interpretarConsulta(): void {
    if (!this.textoConsulta.trim()) return;
    this.cargandoNL.set(true);

    const req: InterpretacionIaRequest = {
      texto: this.textoConsulta,
      entidad: this.entidadSeleccionada,
    };

    this.iaSvc.interpretarConsulta(req).subscribe({
      next: res => {
        if (res.codigo === 200) {
          this.resultadoNL.set(res.data);
        }
        this.cargandoNL.set(false);
      },
      error: err => {
        this.msg.add({ severity: 'error', summary: 'Error IA', detail: err.message });
        this.cargandoNL.set(false);
      },
    });
  }

  severidadNivel(nivel: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (nivel) {
      case 'BAJO': return 'success';
      case 'MEDIO': return 'info';
      case 'ALTO': return 'warn';
      case 'CRITICO': return 'danger';
      default: return 'info';
    }
  }

  colorBarra(nivel: string): string {
    switch (nivel) {
      case 'BAJO': return '#22c55e';
      case 'MEDIO': return '#3b82f6';
      case 'ALTO': return '#f59e0b';
      case 'CRITICO': return '#ef4444';
      default: return '#3b82f6';
    }
  }

  /** Genera datos de demostración para el paralelo seleccionado. */
  private generarDatosDemoParalelo(idParalelo: string): RiesgoEstudianteRequest[] {
    return [
      { id_estudiante: `${idParalelo}-EST001`, porcentaje_asistencia: 45, promedio_calificaciones: 42, evaluaciones_pendientes: 3, materias_reprobadas_historial: 2 },
      { id_estudiante: `${idParalelo}-EST002`, porcentaje_asistencia: 72, promedio_calificaciones: 58, evaluaciones_pendientes: 1, materias_reprobadas_historial: 1 },
      { id_estudiante: `${idParalelo}-EST003`, porcentaje_asistencia: 90, promedio_calificaciones: 85, evaluaciones_pendientes: 0, materias_reprobadas_historial: 0 },
      { id_estudiante: `${idParalelo}-EST004`, porcentaje_asistencia: 55, promedio_calificaciones: 49, evaluaciones_pendientes: 2, materias_reprobadas_historial: 3 },
      { id_estudiante: `${idParalelo}-EST005`, porcentaje_asistencia: 80, promedio_calificaciones: 76, evaluaciones_pendientes: 0, materias_reprobadas_historial: 0 },
    ];
  }
}
