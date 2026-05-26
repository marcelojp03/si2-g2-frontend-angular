import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RespaldoService, RegistroRespaldo, RegistroRestauracion } from '../../../core/services/respaldo.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    Textarea,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="flex flex-col gap-6 p-4">
      <!-- ENCABEZADO -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-surface-800 dark:text-surface-100">Gestión de Backups</h2>
          <p class="text-surface-500 text-sm mt-1">Respaldos por institución exportados a S3</p>
        </div>
        <p-button
          label="Iniciar Respaldo"
          icon="pi pi-database"
          [loading]="iniciandoRespaldo()"
          (onClick)="iniciarRespaldo()"
        />
      </div>

      <!-- LISTA DE RESPALDOS -->
      <div class="card">
        <div class="font-semibold text-lg mb-3">Historial de Respaldos</div>
        <p-table
          [value]="respaldos()"
          [loading]="cargandoRespaldos()"
          [paginator]="true"
          [rows]="10"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>Fecha Inicio</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Tamaño</th>
              <th>Ruta S3</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td>{{ r.fechaInicio | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ r.tipoRespaldo }}</td>
              <td>
                <p-tag [value]="r.estado" [severity]="estadoSeverity(r.estado)" />
              </td>
              <td>{{ r.tamanioBytes ? (r.tamanioBytes / 1024 | number:'1.1-1') + ' KB' : '-' }}</td>
              <td><small class="text-surface-400">{{ r.rutaAlmacenamiento ?? '-' }}</small></td>
              <td>
                <p-button
                  label="Solicitar restauración"
                  icon="pi pi-refresh"
                  size="small"
                  severity="secondary"
                  [disabled]="r.estado !== 'COMPLETADO'"
                  (onClick)="abrirDialogoRestauracion(r)"
                />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center text-surface-400 py-4">No hay respaldos registrados</td></tr>
          </ng-template>
        </p-table>
      </div>

      <!-- LISTA DE RESTAURACIONES (solo SUPER_ADMIN) -->
      @if (esSuperAdmin()) {
        <div class="card">
          <div class="font-semibold text-lg mb-3">Solicitudes de Restauración</div>
          <p-table
            [value]="restauraciones()"
            [loading]="cargandoRestauraciones()"
            [paginator]="true"
            [rows]="10"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Fecha Solicitud</th>
                <th>ID Respaldo</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-r>
              <tr>
                <td>{{ r.fechaSolicitud | date:'dd/MM/yyyy HH:mm' }}</td>
                <td><small>{{ r.idRespaldo }}</small></td>
                <td>{{ r.motivo }}</td>
                <td>
                  <p-tag [value]="r.estado" [severity]="estadoSeverity(r.estado)" />
                </td>
                <td>
                  @if (r.estado === 'PENDIENTE') {
                    <p-button
                      label="Aprobar"
                      icon="pi pi-check"
                      size="small"
                      severity="success"
                      (onClick)="aprobarRestauracion(r.id)"
                    />
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="5" class="text-center text-surface-400 py-4">No hay solicitudes de restauración</td></tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>

    <!-- DIÁLOGO SOLICITAR RESTAURACIÓN -->
    <p-dialog
      header="Solicitar Restauración"
      [(visible)]="mostrarDialogo"
      [modal]="true"
      [style]="{width: '450px'}"
    >
      <div class="flex flex-col gap-3 pt-2">
        <label class="text-sm font-medium">Motivo de la restauración *</label>
        <textarea pTextarea [(ngModel)]="motivoRestauracion" rows="4"
          placeholder="Describa el motivo por el cual necesita restaurar este backup..."
          class="w-full"></textarea>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancelar" severity="secondary" (onClick)="mostrarDialogo = false" />
        <p-button
          label="Solicitar"
          icon="pi pi-send"
          [disabled]="!motivoRestauracion.trim()"
          (onClick)="confirmarSolicitudRestauracion()"
        />
      </ng-template>
    </p-dialog>
  `
})
export class BackupsComponent implements OnInit {
  private respaldoSvc = inject(RespaldoService);
  private authSvc = inject(AuthService);
  private toast = inject(MessageService);

  respaldos = signal<RegistroRespaldo[]>([]);
  restauraciones = signal<RegistroRestauracion[]>([]);
  cargandoRespaldos = signal(false);
  cargandoRestauraciones = signal(false);
  iniciandoRespaldo = signal(false);

  mostrarDialogo = false;
  motivoRestauracion = '';
  private respaldoSeleccionado: RegistroRespaldo | null = null;

  esSuperAdmin(): boolean {
    return this.authSvc.hasRole('SUPER_ADMIN');
  }

  ngOnInit(): void {
    this.cargarRespaldos();
    if (this.esSuperAdmin()) {
      this.cargarRestauraciones();
    }
  }

  cargarRespaldos(): void {
    this.cargandoRespaldos.set(true);
    this.respaldoSvc.listarRespaldos().subscribe({
      next: res => {
        if (res?.codigo === 200) this.respaldos.set(res.data ?? []);
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los respaldos' }),
      complete: () => this.cargandoRespaldos.set(false)
    });
  }

  cargarRestauraciones(): void {
    this.cargandoRestauraciones.set(true);
    this.respaldoSvc.listarRestauraciones().subscribe({
      next: res => {
        if (res?.codigo === 200) this.restauraciones.set(res.data ?? []);
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar las solicitudes' }),
      complete: () => this.cargandoRestauraciones.set(false)
    });
  }

  iniciarRespaldo(): void {
    this.iniciandoRespaldo.set(true);
    this.respaldoSvc.iniciarRespaldo().subscribe({
      next: res => {
        if (res?.codigo === 200) {
          this.toast.add({ severity: 'success', summary: 'Respaldo iniciado', detail: `Estado: ${res.data?.estado}` });
          this.cargarRespaldos();
        }
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo iniciar el respaldo' }),
      complete: () => this.iniciandoRespaldo.set(false)
    });
  }

  abrirDialogoRestauracion(respaldo: RegistroRespaldo): void {
    this.respaldoSeleccionado = respaldo;
    this.motivoRestauracion = '';
    this.mostrarDialogo = true;
  }

  confirmarSolicitudRestauracion(): void {
    if (!this.respaldoSeleccionado) return;
    this.respaldoSvc.solicitarRestauracion(this.respaldoSeleccionado.id, this.motivoRestauracion).subscribe({
      next: res => {
        if (res?.codigo === 200) {
          this.toast.add({ severity: 'success', summary: 'Solicitud creada', detail: 'Pendiente de aprobación por SUPER_ADMIN' });
          this.mostrarDialogo = false;
          if (this.esSuperAdmin()) this.cargarRestauraciones();
        }
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la solicitud' })
    });
  }

  aprobarRestauracion(id: string): void {
    this.respaldoSvc.aprobarRestauracion(id).subscribe({
      next: res => {
        if (res?.codigo === 200) {
          this.toast.add({ severity: 'success', summary: 'Aprobado', detail: 'Restauración aprobada' });
          this.cargarRestauraciones();
        }
      },
      error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo aprobar la restauración' })
    });
  }

  estadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      COMPLETADO: 'success',
      APROBADO: 'success',
      EN_PROGRESO: 'info',
      PENDIENTE: 'warn',
      FALLIDO: 'danger',
      RECHAZADO: 'danger'
    };
    return map[estado] ?? 'secondary';
  }
}
