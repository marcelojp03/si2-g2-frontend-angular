import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardKpi } from '@/core/models/sia.models';

@Component({
    selector: 'app-dashboard-kpi-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <a [routerLink]="kpi.rutaAccion || '/'" class="block no-underline h-full">
            <div class="h-full rounded-lg border border-surface-200 bg-white dark:bg-surface-900 p-4 transition-all hover:shadow-md hover:border-surface-300">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <div class="text-sm text-surface-500 mb-2">{{ kpi.titulo }}</div>
                        <div class="text-3xl font-semibold text-surface-900 dark:text-surface-0 leading-none">{{ kpi.valor }}</div>
                        <div class="text-xs text-surface-500 mt-3">{{ kpi.subtitulo }}</div>
                    </div>
                    <div class="w-11 h-11 rounded-lg flex items-center justify-center" [ngClass]="severityClass(kpi.severidad)">
                        <i [class]="kpi.icono + ' text-lg'"></i>
                    </div>
                </div>
            </div>
        </a>
    `
})
export class DashboardKpiCardComponent {
    @Input({ required: true }) kpi!: DashboardKpi;

    severityClass(severity?: string): string {
        switch (severity) {
            case 'success': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'warn': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'danger': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
            case 'contrast': return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100';
            default: return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
        }
    }
}
