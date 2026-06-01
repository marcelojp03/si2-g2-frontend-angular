import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-crear-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">

        <!-- Éxito -->
        @if (exito()) {
          <div class="flex flex-col items-center gap-4 text-center">
            <div class="text-green-500 text-5xl">✅</div>
            <h2 class="text-xl font-bold text-gray-800">¡Contraseña creada!</h2>
            <p class="text-gray-500 text-sm">Ya puedes iniciar sesión con tu correo y la contraseña que acabas de crear.</p>
            <a routerLink="/auth/login"
               class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-center block transition-colors">
              Ir al login
            </a>
          </div>
        }

        <!-- Token inválido / expirado -->
        @if (errorLink()) {
          <div class="flex flex-col items-center gap-4 text-center">
            <div class="text-red-500 text-5xl">⚠️</div>
            <h2 class="text-xl font-bold text-gray-800">Link expirado</h2>
            <p class="text-gray-500 text-sm">{{ errorLink() }}</p>
            <a routerLink="/auth/login" class="text-blue-600 hover:underline text-sm">Volver al login</a>
          </div>
        }

        <!-- Formulario -->
        @if (!exito() && !errorLink()) {
          <div class="flex flex-col gap-5">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-800">Crea tu contraseña</h1>
              <p class="text-gray-500 text-sm mt-1">Elige una contraseña segura para tu cuenta de administrador.</p>
            </div>

            @if (errorForm()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {{ errorForm() }}
              </div>
            }

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input type="password" [(ngModel)]="nuevaContrasena" name="nuevaContrasena"
                     placeholder="Mínimo 8 caracteres"
                     class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input type="password" [(ngModel)]="confirmarContrasena" name="confirmarContrasena"
                     placeholder="Repite la contraseña"
                     class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div class="text-xs text-gray-400 space-y-1">
              <p [class.text-green-600]="nuevaContrasena.length >= 8">✓ Mínimo 8 caracteres</p>
              <p [class.text-green-600]="tieneNumero()">✓ Al menos un número</p>
              <p [class.text-green-600]="tieneMayuscula()">✓ Al menos una mayúscula</p>
            </div>

            <button (click)="guardar()" [disabled]="cargando()"
                    class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors">
              {{ cargando() ? 'Guardando…' : 'Crear contraseña' }}
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class CrearContrasena implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  nuevaContrasena = '';
  confirmarContrasena = '';

  exito = signal(false);
  cargando = signal(false);
  errorForm = signal<string | null>(null);
  errorLink = signal<string | null>(null);

  private challengeId = '';
  private recoveryToken = '';

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.queryParamMap.get('challengeId') ?? '';
    this.recoveryToken = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.challengeId || !this.recoveryToken) {
      this.errorLink.set('El link de activación no es válido. Contacta al soporte.');
    }
  }

  tieneNumero(): boolean { return /\d/.test(this.nuevaContrasena); }
  tieneMayuscula(): boolean { return /[A-Z]/.test(this.nuevaContrasena); }

  guardar(): void {
    this.errorForm.set(null);

    if (this.nuevaContrasena.length < 8) {
      this.errorForm.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!this.tieneNumero()) {
      this.errorForm.set('La contraseña debe incluir al menos un número.');
      return;
    }
    if (!this.tieneMayuscula()) {
      this.errorForm.set('La contraseña debe incluir al menos una letra mayúscula.');
      return;
    }
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.errorForm.set('Las contraseñas no coinciden.');
      return;
    }

    this.cargando.set(true);
    this.http.post<{ codigo: number; mensaje: string }>(
      `${environment.api.baseUrl}/auth/password-recovery/reset`,
      { challengeId: this.challengeId, recoveryToken: this.recoveryToken, nuevaContrasena: this.nuevaContrasena }
    ).subscribe({
      next: resp => {
        this.cargando.set(false);
        if (resp.codigo === 200) {
          this.exito.set(true);
        } else {
          this.errorForm.set(resp.mensaje ?? 'No se pudo crear la contraseña.');
        }
      },
      error: err => {
        this.cargando.set(false);
        const msg = err?.error?.mensaje ?? 'El link ha expirado o no es válido.';
        this.errorLink.set(msg);
      }
    });
  }
}
