import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardAlert } from '@/core/models/sia.models';

@Component({
    selector: 'app-dashboard-alert-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="rounded-lg border border-surface-200 bg-white dark:bg-surface-900">
            <div class="px-4 py-3 border-b border-surface-200 flex items-center justify-between">
                <div>
                    <h3 class="text-base font-semibold m-0 text-surface-900 dark:text-surface-0">{{ title }}</h3>
                    <p class="text-xs text-surface-500 m-0 mt-1">{{ subtitle }}</p>
                </div>
                <span class="text-xs text-surface-400">{{ alerts.length }}</span>
            </div>
            <div class="divide-y divide-surface-100">
                @if (alerts.length) {
                    @for (alert of alerts; track alert.id) {
                        <a [routerLink]="alert.rutaAccion || '/'" class="flex gap-3 px-4 py-3 no-underline hover:bg-surface-50 dark:hover:bg-surface-800/60">
                            <span class="mt-1 inline-flex w-2.5 h-2.5 rounded-full flex-shrink-0" [ngClass]="dotClass(alert.severidad)"></span>
                            <div class="min-w-0">
                                <div class="font-medium text-sm text-surface-900 dark:text-surface-0">{{ alert.titulo }}</div>
                                <div class="text-xs text-surface-500 mt-1">{{ alert.detalle }}</div>
                            </div>
                        </a>
                    }
                } @else {
                    <div class="px-4 py-8 text-sm text-surface-400 text-center">No hay alertas para mostrar.</div>
                }
            </div>
        </div>
    `
})
export class DashboardAlertListComponent {
    @Input() title = 'Alertas';
    @Input() subtitle = 'Estado operativo';
    @Input() alerts: DashboardAlert[] = [];

    dotClass(severity?: string): string {
        switch (severity) {
            case 'success': return 'bg-emerald-500';
            case 'warn': return 'bg-amber-500';
            case 'danger': return 'bg-rose-500';
            default: return 'bg-sky-500';
        }
    }
}
