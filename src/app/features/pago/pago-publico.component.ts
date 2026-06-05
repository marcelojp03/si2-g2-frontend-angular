import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagoPublicoService, PagoPublicoDto } from './pago-publico.service';

@Component({
  selector: 'app-pago-publico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <!-- Cargando -->
        @if (loading()) {
          <div class="flex flex-col items-center gap-4 py-8">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-500">Cargando información de pago…</p>
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="flex flex-col items-center gap-4 py-8 text-center">
            <div class="text-red-500 text-5xl">⚠️</div>
            <h2 class="text-xl font-semibold text-gray-800">Link no válido</h2>
            <p class="text-gray-500">{{ error() }}</p>
          </div>
        }

        <!-- Éxito — institución activada -->
        @if (pagado()) {
          <div class="flex flex-col items-center gap-4 py-8 text-center">
            <div class="text-green-500 text-5xl">✅</div>
            <h2 class="text-2xl font-bold text-gray-800">¡Pago confirmado!</h2>
            <p class="text-gray-600">Tu institución ha sido activada. Recibirás un correo con el link para crear tu contraseña.</p>
          </div>
        }

        <!-- Formulario de pago con QR -->
        @if (!loading() && !error() && !pagado() && pago()) {
          <div class="flex flex-col items-center gap-5">
            <h1 class="text-2xl font-bold text-gray-800 text-center">Activar suscripción</h1>

            <!-- Datos del plan -->
            <div class="w-full bg-blue-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500 mb-1">{{ pago()!.glosa }}</p>
              <p class="text-3xl font-bold text-blue-600">
                {{ pago()!.monto | number:'1.2-2' }} {{ pago()!.moneda }}
              </p>
              @if (pago()!.fechaExpiracion) {
                <p class="text-xs text-gray-400 mt-1">Vence el {{ pago()!.fechaExpiracion }}</p>
              }
            </div>

            <!-- Badge DEMO -->
            @if (pago()!.proveedor === 'VPAY_DEMO') {
              <div class="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                MODO DEMO — No es un pago real
              </div>
            }

            <!-- QR -->
            @if (pago()!.qrBase64) {
              <div class="flex flex-col items-center gap-2">
                <img [src]="'data:image/png;base64,' + pago()!.qrBase64"
                     alt="QR de pago" class="w-56 h-56 border border-gray-200 rounded-lg" />
                <p class="text-sm text-gray-500">Escanea con tu app bancaria</p>
                @if (pago()!.idQr) {
                  <p class="text-xs text-gray-500">ID QR: <span class="font-mono">{{ pago()!.idQr }}</span></p>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center gap-2 py-4">
                <div class="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-400">Generando QR…</p>
              </div>
            }

            <!-- Estado de polling -->
            <div class="flex items-center gap-2 text-sm text-gray-400">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Esperando confirmación de pago…
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class PagoPublicoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private pagoService = inject(PagoPublicoService);

  loading = signal(true);
  error = signal<string | null>(null);
  pago = signal<PagoPublicoDto | null>(null);
  pagado = signal(false);

  private token = '';
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    if (!this.token) {
      this.error.set('Link de pago inválido.');
      this.loading.set(false);
      return;
    }
    this.cargarPago();
  }

  ngOnDestroy(): void {
    this.detenerPolling();
  }

  private cargarPago(): void {
    this.pagoService.obtenerPago(this.token).subscribe({
      next: resp => {
        if (resp.codigo === 200 && resp.data) {
          this.pago.set(resp.data);
          if (resp.data.estado === 'PAGADO') {
            this.pagado.set(true);
          } else {
            this.iniciarPolling();
          }
        } else {
          this.error.set('No se pudo cargar la información del pago.');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Link de pago no válido o expirado.');
        this.loading.set(false);
      }
    });
  }

  private iniciarPolling(): void {
    this.pollInterval = setInterval(() => {
      this.pagoService.consultarEstado(this.token).subscribe({
        next: resp => {
          if (resp.codigo === 200 && resp.data?.pagado) {
            this.pagado.set(true);
            this.detenerPolling();
          }
        },
        error: () => { /* ignorar errores de polling silenciosamente */ }
      });
    }, 5000);
  }

  private detenerPolling(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
