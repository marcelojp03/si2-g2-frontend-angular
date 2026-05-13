import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ButtonModule, InputTextModule, PasswordModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-center" />
        <div class="min-h-screen flex items-center justify-center bg-surface-0 dark:bg-surface-950 p-6">
            <div class="card w-full max-w-xl">
                <div class="mb-5">
                    <h2 class="text-2xl font-bold m-0">Recuperar contraseña</h2>
                    <p class="text-surface-500 text-sm mt-2">Completa el flujo de recuperación en tres pasos.</p>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label>Correo electrónico</label>
                        <input pInputText [(ngModel)]="correo" placeholder="usuario@correo.com" />
                        <p-button label="1. Solicitar código" (onClick)="requestRecovery()" [loading]="loadingRequest" />
                    </div>

                    <div class="flex flex-col gap-2" *ngIf="challengeId">
                        <label>Código de verificación</label>
                        <input pInputText [(ngModel)]="codigoVerificacion" placeholder="Código OTP" />
                        <p-button label="2. Verificar código" (onClick)="verifyRecovery()" [loading]="loadingVerify" />
                    </div>

                    <div class="flex flex-col gap-2" *ngIf="recoveryToken">
                        <label>Nueva contraseña</label>
                        <p-password [(ngModel)]="nuevaContrasena" [feedback]="true" [toggleMask]="true" />
                        <p-button label="3. Restablecer contraseña" (onClick)="resetPassword()" [loading]="loadingReset" />
                    </div>

                    <div *ngIf="codigoDebug" class="p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900 text-sm">
                        Código de verificación de desarrollo: <strong>{{ codigoDebug }}</strong>
                    </div>

                    <p-button label="Volver al login" severity="secondary" [text]="true" routerLink="/auth/login" />
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    correo = '';
    challengeId = '';
    codigoVerificacion = '';
    recoveryToken = '';
    nuevaContrasena = '';
    codigoDebug = '';
    loadingRequest = false;
    loadingVerify = false;
    loadingReset = false;

    requestRecovery(): void {
        if (!this.correo) return;
        this.loadingRequest = true;
        this.authService.requestPasswordRecovery(this.correo).subscribe({
            next: response => {
                this.loadingRequest = false;
                this.challengeId = response.data?.challengeId ?? '';
                this.codigoDebug = response.data?.codigoVerificacionDebug ?? '';
                this.messageService.add({ severity: 'success', summary: 'Código generado', detail: response.mensaje, life: 3000 });
            },
            error: (e) => {
                this.loadingRequest = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.mensaje ?? 'No se pudo generar el desafío', life: 4000 });
            }
        });
    }

    verifyRecovery(): void {
        if (!this.challengeId || !this.codigoVerificacion) return;
        this.loadingVerify = true;
        this.authService.verifyPasswordRecovery(this.challengeId, this.codigoVerificacion).subscribe({
            next: response => {
                this.loadingVerify = false;
                this.recoveryToken = response.data?.recoveryToken ?? '';
                this.messageService.add({ severity: 'success', summary: 'Código verificado', detail: response.mensaje, life: 3000 });
            },
            error: (e) => {
                this.loadingVerify = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.mensaje ?? 'Código inválido', life: 4000 });
            }
        });
    }

    resetPassword(): void {
        if (!this.challengeId || !this.recoveryToken || !this.nuevaContrasena) return;
        this.loadingReset = true;
        this.authService.resetPassword(this.challengeId, this.recoveryToken, this.nuevaContrasena).subscribe({
            next: response => {
                this.loadingReset = false;
                this.messageService.add({ severity: 'success', summary: 'Contraseña actualizada', detail: response.mensaje, life: 3000 });
                setTimeout(() => this.router.navigate(['/auth/login']), 1200);
            },
            error: (e) => {
                this.loadingReset = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: e.error?.mensaje ?? 'No se pudo restablecer la contraseña', life: 4000 });
            }
        });
    }
}
