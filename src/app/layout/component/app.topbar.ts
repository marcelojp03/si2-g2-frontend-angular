import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { Overlay, OverlayModule } from 'primeng/overlay';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '@/core/services/auth.service';
import { UsuarioSIA } from '@/core/models/auth.model';
import { Subscription, interval } from 'rxjs';
import { NotificacionesService, Notificacion } from '@/core/services/notificaciones.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, OverlayModule, ButtonModule, TooltipModule, AppConfigurator],
    template: `
        <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body" />
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                             style="background: linear-gradient(135deg, #0d2145, #1a4080)">
                            <i class="pi pi-graduation-cap text-white text-sm"></i>
                        </div>
                        <span class="font-bold text-lg tracking-tight text-surface-900 dark:text-surface-0">SIA</span>
                    </div>
                </a>
            </div>
            <div class="layout-topbar-actions">
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <div class="hidden">
                        <button class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein"
                            leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>
                </div>
                <button class="layout-topbar-menu-button layout-topbar-action"
                        pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein"
                        leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>
                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        @if (usuario?.planCodigo) {
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold mr-2"
                                  style="background: rgba(13,33,69,0.08); color: #0d2145"
                                  title="Plan de suscripcion activo">
                                <i class="pi pi-star-fill text-[10px]"></i>
                                {{ usuario?.planCodigo }}
                            </span>
                        }
                        <button type="button" class="layout-topbar-action relative" (click)="notifVisible = !notifVisible">
                            <i class="pi pi-bell"></i>
                            @if (notifNoLeidas > 0) {
                                <span class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{{ notifNoLeidas > 99 ? '99+' : notifNoLeidas }}</span>
                            }
                        </button>
                        <p-overlay [(visible)]="notifVisible" [style]="{width: '380px', background: 'var(--p-surface-0)'}" appendTo="body">
                            <div class="flex flex-col" style="max-height: 24rem">
                                <div class="flex items-center justify-between border-b border-surface-200 px-4 py-3 dark:border-surface-700">
                                    <span class="font-semibold text-sm">Notificaciones</span>
                                    @if (notifNoLeidas > 0) {
                                        <button pButton severity="secondary" size="small" (click)="marcarTodasLeidas()" pTooltip="Limpiar" class="p-button-text">Limpiar</button>
                                    }
                                </div>
                                <div class="overflow-y-auto">
                                    @for (n of notificaciones; track n.id) {
                                        <div class="flex cursor-pointer gap-3 border-b border-surface-100 px-4 py-3 transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800"
                                             (click)="marcarLeida(n)">
                                            <div class="mt-1">
                                                @if (!n.leida) {
                                                    <span class="block h-2 w-2 rounded-full bg-primary-500"></span>
                                                } @else {
                                                    <span class="block h-2 w-2"></span>
                                                }
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p class="m-0 text-sm font-medium truncate">{{ n.titulo }}</p>
                                                <p class="m-0 text-xs text-surface-500 truncate">{{ n.mensaje }}</p>
                                                <p class="m-0 mt-1 text-[10px] text-surface-400">{{ n.creadoEn | date:'dd/MM HH:mm' }}</p>
                                            </div>
                                            @if (n.tipo) {
                                                <span class="shrink-0 self-start rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-800">{{ n.tipo }}</span>
                                            }
                                        </div>
                                    } @empty {
                                        <div class="flex flex-col items-center gap-2 px-4 py-8 text-surface-400">
                                            <i class="pi pi-inbox text-2xl"></i>
                                            <span class="text-sm">No hay notificaciones</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        </p-overlay>
                        <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                            <i class="pi pi-user"></i>
                            <span>{{ usuario?.correo || 'Perfil' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppTopbar implements OnInit, OnDestroy {
    @ViewChild('userMenu') userMenu!: Menu;
    notifVisible = false;
    usuario: UsuarioSIA | null = null;
    userMenuItems: MenuItem[] = [];
    notificaciones: Notificacion[] = [];
    notifNoLeidas = 0;
    layoutService = inject(LayoutService);
    private authService = inject(AuthService);
    private notifService = inject(NotificacionesService);
    private router = inject(Router);
    private subs: Subscription[] = [];

    ngOnInit(): void {
        this.subs.push(
            this.authService.currentUser$.subscribe((user) => {
                this.usuario = user;
                this.buildUserMenu(user);
                if (user && !user.roles.includes('SUPER_ADMIN')) {
                    this.cargarNotificaciones();
                    this.subs.push(interval(30000).subscribe(() => this.cargarNotificaciones()));
                }
            })
        );
    }

    ngOnDestroy(): void { this.subs.forEach((s) => s.unsubscribe()); }

    private cargarNotificaciones(): void {
        this.notifService.contarNoLeidas().subscribe(c => this.notifNoLeidas = c);
        this.notifService.misNotificaciones(true).subscribe(r => {
            if (r.codigo === 200) this.notificaciones = r.data ?? [];
        });
    }

    marcarLeida(n: Notificacion): void {
        if (!n.leida) {
            this.notifService.marcarLeida(n.id).subscribe(() => {
                n.leida = true;
                this.notifNoLeidas = Math.max(0, this.notifNoLeidas - 1);
            });
        }
    }

    marcarTodasLeidas(): void {
        this.notifService.marcarTodasLeidas().subscribe(() => {
            this.notificaciones.forEach(n => n.leida = true);
            this.notifNoLeidas = 0;
        });
    }

    private buildUserMenu(user: UsuarioSIA | null): void {
        const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
        this.userMenuItems = [
            ...(user ? [{ label: user.correo, disabled: true, styleClass: 'text-xs' }] : []),
            ...(isSuperAdmin ? [{ label: 'Super Administrador', disabled: true, styleClass: 'text-xs text-primary' }] : []),
            ...(user?.planCodigo ? [{ label: 'Plan: ' + user.planCodigo, icon: 'pi pi-star-fill', disabled: true, styleClass: 'text-xs' }] : []),
            { separator: true },
            { label: 'Mi perfil', icon: 'pi pi-user', command: () => this.router.navigate([isSuperAdmin ? '/admin/perfil' : '/perfil']) },
            { separator: true },
            { label: 'Cerrar sesion', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
        ];
    }

    toggleDarkMode(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}