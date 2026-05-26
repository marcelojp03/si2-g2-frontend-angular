import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SolicitudService } from '@/core/services/solicitud.service';
import { SaasService } from '@/core/services/saas.service';
import { PlanSuscripcionResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [
        CommonModule, CurrencyPipe, FormsModule, RouterModule,
        ButtonModule, InputTextModule, TextareaModule, SelectModule,
        CardModule, TagModule, ToastModule,
    ],
    providers: [MessageService],
    template: `
    <p-toast />
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

        <!-- NAVBAR -->
        <nav class="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <i class="pi pi-graduation-cap text-2xl text-blue-600"></i>
                <span class="text-xl font-bold text-gray-800">SIA — Sistema de Gestión Académica</span>
            </div>
            <a routerLink="/auth/login"
               class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                <i class="pi pi-sign-in"></i> Iniciar sesión
            </a>
        </nav>

        <!-- HERO -->
        <section class="max-w-6xl mx-auto px-6 py-16 text-center">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4">
                Digitaliza la gestión de tu institución educativa
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Administra cursos, docentes, horarios, asistencia y calificaciones en una sola plataforma SaaS.
                Solicita acceso hoy y nuestro equipo te configurará todo.
            </p>
            <a href="#planes" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold
                        hover:bg-blue-700 transition text-lg">
                Ver planes
            </a>
        </section>

        <!-- PLANES -->
        <section id="planes" class="max-w-6xl mx-auto px-6 py-12">
            <h2 class="text-3xl font-bold text-center text-gray-800 mb-10">Planes disponibles</h2>

            @if (cargandoPlanes()) {
                <div class="text-center text-gray-500 py-8">
                    <i class="pi pi-spin pi-spinner text-2xl"></i>
                    <p class="mt-2">Cargando planes...</p>
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    @for (plan of planes(); track plan.id) {
                        <div class="bg-white rounded-2xl shadow-md overflow-hidden border-2 transition"
                             [class.border-blue-500]="planSeleccionado() === plan.id"
                             [class.border-transparent]="planSeleccionado() !== plan.id">
                            <div class="p-6">
                                <h3 class="text-xl font-bold text-gray-800 mb-2">{{ plan.nombre }}</h3>
                                <p class="text-3xl font-extrabold text-blue-600 mb-1">
                                    {{ plan.precioMensual | currency:'USD':'symbol':'1.0-0' }}
                                    <span class="text-base font-normal text-gray-500">/mes</span>
                                </p>
                                <p class="text-gray-500 text-sm mb-4">{{ plan.descripcion }}</p>
                                <ul class="space-y-2 mb-6">
                                    <li class="flex items-center gap-2 text-sm text-gray-700">
                                        <i class="pi pi-users text-blue-500"></i>
                                        Hasta {{ plan.maxUsuarios }} usuarios
                                    </li>
                                    @for (modulo of plan.modulos; track modulo.id) {
                                        <li class="flex items-center gap-2 text-sm text-gray-700">
                                            <i class="pi pi-check text-green-500"></i>
                                            {{ modulo.nombre }}
                                        </li>
                                    }
                                </ul>
                                <button (click)="seleccionarPlan(plan.id)"
                                        class="w-full py-2 rounded-lg font-semibold transition"
                                        [class.bg-blue-600]="planSeleccionado() !== plan.id"
                                        [class.text-white]="planSeleccionado() !== plan.id"
                                        [class.hover:bg-blue-700]="planSeleccionado() !== plan.id"
                                        [class.bg-green-500]="planSeleccionado() === plan.id"
                                        [class.cursor-default]="planSeleccionado() === plan.id">
                                    {{ planSeleccionado() === plan.id ? '✓ Seleccionado' : 'Solicitar este plan' }}
                                </button>
                            </div>
                        </div>
                    }
                </div>
            }
        </section>

        <!-- FORMULARIO DE SOLICITUD -->
        <section id="solicitud" class="max-w-3xl mx-auto px-6 py-12">
            <div class="bg-white rounded-2xl shadow-lg p-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Solicitar acceso</h2>
                <p class="text-gray-500 mb-8">
                    Completa el formulario y nuestro equipo te contactará para activar tu institución.
                </p>

                @if (enviado()) {
                    <div class="text-center py-12">
                        <i class="pi pi-check-circle text-6xl text-green-500 mb-4 block"></i>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">¡Solicitud enviada!</h3>
                        <p class="text-gray-600 mb-6">
                            Revisaremos tu solicitud y te contactaremos a <strong>{{ form.correoContacto }}</strong> en breve.
                        </p>
                        <button pButton label="Enviar otra solicitud" icon="pi pi-refresh"
                                (click)="reiniciar()" severity="secondary"></button>
                    </div>
                } @else {
                    <form (ngSubmit)="enviarSolicitud()" #f="ngForm">

                        <!-- Datos institución -->
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="pi pi-building text-blue-500"></i> Datos de la institución
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">
                                    Nombre de la institución <span class="text-red-500">*</span>
                                </label>
                                <input pInputText [(ngModel)]="form.nombreInstitucion" name="nombreInstitucion"
                                       required maxlength="200" placeholder="Ej. Colegio San Ignacio" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Tipo de institución <span class="text-red-500">*</span></label>
                                <p-select [(ngModel)]="form.tipoInstitucion" name="tipoInstitucion"
                                          [options]="tiposInstitucion" optionLabel="label" optionValue="value"
                                          placeholder="Seleccionar" class="w-full" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Teléfono</label>
                                <input pInputText [(ngModel)]="form.telefonoInstitucion" name="telefonoInstitucion"
                                       maxlength="30" placeholder="+591 3 333-3333" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Correo institucional</label>
                                <input pInputText type="email" [(ngModel)]="form.correoInstitucion"
                                       name="correoInstitucion" maxlength="150" placeholder="info@colegio.edu.bo" />
                            </div>
                            <div class="flex flex-col gap-1 md:col-span-2">
                                <label class="text-sm font-medium text-gray-700">Dirección</label>
                                <input pInputText [(ngModel)]="form.direccionInstitucion" name="direccionInstitucion"
                                       maxlength="255" placeholder="Av. Principal #123, Santa Cruz" />
                            </div>
                        </div>

                        <!-- Datos contacto -->
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="pi pi-user text-blue-500"></i> Datos del responsable
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Nombres <span class="text-red-500">*</span></label>
                                <input pInputText [(ngModel)]="form.nombresContacto" name="nombresContacto"
                                       required maxlength="120" placeholder="Juan Carlos" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Apellidos <span class="text-red-500">*</span></label>
                                <input pInputText [(ngModel)]="form.apellidosContacto" name="apellidosContacto"
                                       required maxlength="120" placeholder="García López" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Correo de contacto <span class="text-red-500">*</span></label>
                                <input pInputText type="email" [(ngModel)]="form.correoContacto" name="correoContacto"
                                       required maxlength="150" placeholder="juan@ejemplo.com" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm font-medium text-gray-700">Teléfono de contacto</label>
                                <input pInputText [(ngModel)]="form.telefonoContacto" name="telefonoContacto"
                                       maxlength="30" placeholder="+591 70000000" />
                            </div>
                        </div>

                        <!-- Plan -->
                        <h3 class="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="pi pi-box text-blue-500"></i> Plan solicitado
                        </h3>
                        <div class="mb-4">
                            <p-select [(ngModel)]="form.idPlan" name="idPlan"
                                      [options]="planes()" optionLabel="nombre" optionValue="id"
                                      placeholder="Seleccionar plan" class="w-full" required />
                        </div>

                        <!-- Mensaje -->
                        <div class="flex flex-col gap-1 mb-8">
                            <label class="text-sm font-medium text-gray-700">Mensaje adicional</label>
                            <textarea pTextarea [(ngModel)]="form.mensaje" name="mensaje"
                                      maxlength="1000" rows="3"
                                      placeholder="Cuéntanos sobre tu institución, número de alumnos, requerimientos especiales..."></textarea>
                        </div>

                        <button pButton type="submit" label="Enviar solicitud" icon="pi pi-send"
                                class="w-full" [loading]="enviando()"
                                [disabled]="!f.valid || !form.idPlan || enviando()">
                        </button>
                    </form>
                }
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="bg-gray-800 text-gray-300 py-8 text-center mt-12">
            <p class="text-sm">© 2026 SIA — Sistema de Gestión Académica SaaS · UAGRM · Grupo 2 SI2</p>
        </footer>
    </div>
    `,
})
export class LandingComponent implements OnInit {
    private solicitudService = inject(SolicitudService);
    private saasService = inject(SaasService);
    private messageService = inject(MessageService);

    planes = signal<PlanSuscripcionResponse[]>([]);
    cargandoPlanes = signal(false);
    planSeleccionado = signal<string>('');
    enviando = signal(false);
    enviado = signal(false);

    tiposInstitucion = [
        { label: 'Privado', value: 'PRIVADO' },
        { label: 'Fiscal', value: 'FISCAL' },
        { label: 'Convenio', value: 'CONVENIO' },
    ];

    form = {
        nombreInstitucion: '',
        tipoInstitucion: 'PRIVADO',
        telefonoInstitucion: '',
        correoInstitucion: '',
        direccionInstitucion: '',
        nombresContacto: '',
        apellidosContacto: '',
        correoContacto: '',
        telefonoContacto: '',
        idPlan: '',
        mensaje: '',
    };

    ngOnInit(): void {
        this.cargarPlanes();
    }

    cargarPlanes(): void {
        this.cargandoPlanes.set(true);
        this.saasService.listarPlanes('ACTIVO').subscribe({
            next: res => {
                if (res.codigo === 200) this.planes.set(res.data ?? []);
                this.cargandoPlanes.set(false);
            },
            error: () => this.cargandoPlanes.set(false),
        });
    }

    seleccionarPlan(idPlan: string): void {
        this.planSeleccionado.set(idPlan);
        this.form.idPlan = idPlan;
        const el = document.getElementById('solicitud');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    enviarSolicitud(): void {
        if (!this.form.idPlan) {
            this.messageService.add({ severity: 'warn', summary: 'Plan requerido', detail: 'Por favor selecciona un plan.' });
            return;
        }
        this.enviando.set(true);
        this.solicitudService.enviar({ ...this.form }).subscribe({
            next: res => {
                this.enviando.set(false);
                if (res.codigo === 200 || res.codigo === 201) {
                    this.enviado.set(true);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje });
                }
            },
            error: err => {
                this.enviando.set(false);
                const msg = err?.error?.mensaje ?? 'Ocurrió un error al enviar la solicitud.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            },
        });
    }

    reiniciar(): void {
        this.enviado.set(false);
        this.planSeleccionado.set('');
        this.form = {
            nombreInstitucion: '', tipoInstitucion: 'PRIVADO', telefonoInstitucion: '',
            correoInstitucion: '', direccionInstitucion: '', nombresContacto: '', apellidosContacto: '',
            correoContacto: '', telefonoContacto: '', idPlan: '', mensaje: '',
        };
    }
}
