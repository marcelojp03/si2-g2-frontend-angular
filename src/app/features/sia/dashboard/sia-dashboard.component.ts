import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DashboardCatalogoFiltrosResponse, DashboardInstitucionalResponse } from '@/core/models/sia.models';
import { AuthService } from '@/core/services/auth.service';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardAlertListComponent } from '@/shared/components/dashboard-alert-list/dashboard-alert-list.component';
import { DashboardChartPanelComponent } from '@/shared/components/dashboard-chart-panel/dashboard-chart-panel.component';
import { DashboardFiltersComponent } from '@/shared/components/dashboard-filters/dashboard-filters.component';
import { DashboardKpiCardComponent } from '@/shared/components/dashboard-kpi-card/dashboard-kpi-card.component';
import { DashboardQuickActionsComponent } from '@/shared/components/dashboard-quick-actions/dashboard-quick-actions.component';
import { DashboardSetupStatusComponent } from '@/shared/components/dashboard-setup-status/dashboard-setup-status.component';

@Component({
    selector: 'app-sia-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        SkeletonModule,
        ButtonModule,
        DashboardAlertListComponent,
        DashboardChartPanelComponent,
        DashboardFiltersComponent,
        DashboardKpiCardComponent,
        DashboardQuickActionsComponent,
        DashboardSetupStatusComponent,
    ],
    templateUrl: './sia-dashboard.component.html'
})
export class SiaDashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);
    private authService = inject(AuthService);

    dashboard = signal<DashboardInstitucionalResponse | null>(null);
    catalogo = signal<DashboardCatalogoFiltrosResponse | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);
    filters = signal<Record<string, string>>({});

    ngOnInit(): void {
        this.cargarCatalogo();
        this.cargarDashboard();
    }

    cargarCatalogo(): void {
        this.dashboardService.getCatalogoFiltros().subscribe({
            next: (response) => this.catalogo.set(response.data ?? null),
        });
    }

    cargarDashboard(): void {
        this.loading.set(true);
        this.error.set(null);
        this.dashboardService.getMiDashboard(this.filters()).subscribe({
            next: (response) => {
                this.dashboard.set(response.data ?? null);
                this.loading.set(false);
            },
            error: (error) => {
                this.error.set(error?.error?.mensaje ?? 'No se pudo cargar el dashboard institucional');
                this.loading.set(false);
            }
        });
    }

    onFiltersChange(filters: Record<string, string>): void {
        this.filters.set(filters);
        this.cargarDashboard();
    }

    get roleLabel(): string {
        const user = this.authService.getCurrentUser();
        if (!user?.roles?.length) return 'Usuario institucional';
        if (user.roles.includes('ADMIN_INSTITUCION')) return 'Administrador institucional';
        if (user.roles.includes('DIRECTOR')) return 'Director';
        if (user.roles.includes('SECRETARIO')) return 'Secretario';
        if (user.roles.includes('DOCENTE')) return 'Docente';
        if (user.roles.includes('TUTOR')) return 'Tutor';
        if (user.roles.includes('ESTUDIANTE')) return 'Estudiante';
        return user.roles[0];
    }
}
