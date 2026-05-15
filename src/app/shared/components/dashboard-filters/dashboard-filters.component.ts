import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardCatalogoFiltrosResponse } from '@/core/models/sia.models';

interface DashboardFiltersValue {
    gestion: string;
    periodo: string;
    curso: string;
    paralelo: string;
}

@Component({
    selector: 'app-dashboard-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="rounded-lg border border-surface-200 bg-white dark:bg-surface-900 p-4">
            <div class="flex items-center justify-between gap-3 mb-4">
                <div>
                    <h3 class="text-base font-semibold m-0 text-surface-900 dark:text-surface-0">Filtros</h3>
                    <p class="text-xs text-surface-500 mt-1 mb-0">Refinan el contexto visible del dashboard.</p>
                </div>
                <button type="button" class="text-xs text-primary font-medium" (click)="reset()">Limpiar</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <label class="flex flex-col gap-1 text-xs text-surface-500">
                    Gestion
                    <select class="w-full rounded-lg border border-surface-200 bg-transparent px-3 py-2 text-sm text-surface-900 dark:text-surface-0" [(ngModel)]="localFilters.gestion" (ngModelChange)="emitChange()">
                        <option value="">Todas</option>
                        @for (item of catalogo?.gestiones ?? []; track item.valor) { <option [value]="item.valor">{{ item.etiqueta }}</option> }
                    </select>
                </label>
                <label class="flex flex-col gap-1 text-xs text-surface-500">
                    Periodo
                    <select class="w-full rounded-lg border border-surface-200 bg-transparent px-3 py-2 text-sm text-surface-900 dark:text-surface-0" [(ngModel)]="localFilters.periodo" (ngModelChange)="emitChange()">
                        <option value="">Todos</option>
                        @for (item of catalogo?.periodos ?? []; track item.valor) { <option [value]="item.valor">{{ item.etiqueta }}</option> }
                    </select>
                </label>
                <label class="flex flex-col gap-1 text-xs text-surface-500">
                    Curso
                    <select class="w-full rounded-lg border border-surface-200 bg-transparent px-3 py-2 text-sm text-surface-900 dark:text-surface-0" [(ngModel)]="localFilters.curso" (ngModelChange)="emitChange()">
                        <option value="">Todos</option>
                        @for (item of catalogo?.cursos ?? []; track item.valor) { <option [value]="item.valor">{{ item.etiqueta }}</option> }
                    </select>
                </label>
                <label class="flex flex-col gap-1 text-xs text-surface-500">
                    Paralelo
                    <select class="w-full rounded-lg border border-surface-200 bg-transparent px-3 py-2 text-sm text-surface-900 dark:text-surface-0" [(ngModel)]="localFilters.paralelo" (ngModelChange)="emitChange()">
                        <option value="">Todos</option>
                        @for (item of catalogo?.paralelos ?? []; track item.valor) { <option [value]="item.valor">{{ item.etiqueta }}</option> }
                    </select>
                </label>
            </div>
        </div>
    `
})
export class DashboardFiltersComponent {
    @Input() catalogo: DashboardCatalogoFiltrosResponse | null = null;
    @Input() set filters(value: Record<string, string>) {
        this.localFilters = {
            ...this.localFilters,
            gestion: value?.['gestion'] ?? this.localFilters.gestion,
            periodo: value?.['periodo'] ?? this.localFilters.periodo,
            curso: value?.['curso'] ?? this.localFilters.curso,
            paralelo: value?.['paralelo'] ?? this.localFilters.paralelo,
        };
    }
    @Output() filtersChange = new EventEmitter<Record<string, string>>();

    localFilters: DashboardFiltersValue = {
        gestion: '',
        periodo: '',
        curso: '',
        paralelo: '',
    };

    emitChange(): void {
        this.filtersChange.emit({ ...this.localFilters });
    }

    reset(): void {
        this.localFilters = { gestion: '', periodo: '', curso: '', paralelo: '' };
        this.emitChange();
    }
}
