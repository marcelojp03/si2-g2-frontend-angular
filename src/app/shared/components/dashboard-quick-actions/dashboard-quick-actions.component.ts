import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardAction } from '@/core/models/sia.models';

@Component({
    selector: 'app-dashboard-quick-actions',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="rounded-lg border border-surface-200 bg-white dark:bg-surface-900 p-4">
            <div class="mb-4">
                <h3 class="text-base font-semibold m-0 text-surface-900 dark:text-surface-0">{{ title }}</h3>
                <p class="text-xs text-surface-500 mt-1 mb-0">{{ subtitle }}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (action of actions; track action.codigo) {
                    <a [routerLink]="action.ruta || '/'" class="rounded-lg border border-surface-200 px-3 py-3 no-underline hover:border-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800/60">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <i [class]="action.icono + ' text-surface-700 dark:text-surface-200'"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="font-medium text-sm text-surface-900 dark:text-surface-0">{{ action.titulo }}</div>
                                <div class="text-xs text-surface-500 mt-1">{{ action.descripcion }}</div>
                            </div>
                        </div>
                    </a>
                }
            </div>
        </div>
    `
})
export class DashboardQuickActionsComponent {
    @Input() title = 'Accesos rapidos';
    @Input() subtitle = 'Navegacion operativa';
    @Input() actions: DashboardAction[] = [];
}
