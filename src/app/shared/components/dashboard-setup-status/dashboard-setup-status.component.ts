import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardInstitucionInfo, GestionAcademicaResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-dashboard-setup-status',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="rounded-lg border border-surface-200 bg-white dark:bg-surface-900 p-4">
            <div class="flex items-start gap-4">
                @if (institucion?.logoUrl) {
                    <img [src]="institucion?.logoUrl || ''" [alt]="institucion?.nombre || 'Institucion'" class="w-14 h-14 rounded-lg object-cover border border-surface-200" />
                } @else {
                    <div class="w-14 h-14 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                        <i class="pi pi-building text-surface-500"></i>
                    </div>
                }
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <h2 class="text-xl font-semibold m-0 text-surface-900 dark:text-surface-0">{{ institucion?.nombreCorto || institucion?.nombre }}</h2>
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-200">{{ institucion?.tipoInstitucion }}</span>
                    </div>
                    <p class="text-sm text-surface-500 mt-1 mb-3">{{ institucion?.direccion || 'Ubicacion institucional por completar' }}</p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                            <div class="text-surface-400 text-xs uppercase">Gestion activa</div>
                            <div class="font-medium text-surface-800 dark:text-surface-100">{{ gestionActiva?.nombre || 'Sin gestion activa' }}</div>
                        </div>
                        <div>
                            <div class="text-surface-400 text-xs uppercase">Estado</div>
                            <div class="font-medium text-surface-800 dark:text-surface-100">{{ institucion?.estado }}</div>
                        </div>
                        <div>
                            <div class="text-surface-400 text-xs uppercase">Branding</div>
                            <div class="font-medium text-surface-800 dark:text-surface-100">{{ institucion?.colorPrimario || '#0a2e60' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class DashboardSetupStatusComponent {
    @Input() institucion: DashboardInstitucionInfo | null = null;
    @Input() gestionActiva: GestionAcademicaResponse | null = null;
}
