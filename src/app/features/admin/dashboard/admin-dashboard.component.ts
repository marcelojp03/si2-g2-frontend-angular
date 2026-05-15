import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { DashboardGlobalResponse } from '@/core/models/sia.models';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardAlertListComponent } from '@/shared/components/dashboard-alert-list/dashboard-alert-list.component';
import { DashboardChartPanelComponent } from '@/shared/components/dashboard-chart-panel/dashboard-chart-panel.component';
import { DashboardKpiCardComponent } from '@/shared/components/dashboard-kpi-card/dashboard-kpi-card.component';
import { DashboardQuickActionsComponent } from '@/shared/components/dashboard-quick-actions/dashboard-quick-actions.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        SkeletonModule,
        TableModule,
        DashboardAlertListComponent,
        DashboardChartPanelComponent,
        DashboardKpiCardComponent,
        DashboardQuickActionsComponent,
    ],
    templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
    private dashboardService = inject(DashboardService);

    dashboard = signal<DashboardGlobalResponse | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.cargar();
    }

    cargar(): void {
        this.loading.set(true);
        this.error.set(null);
        this.dashboardService.getDashboardGlobal().subscribe({
            next: (response) => {
                this.dashboard.set(response.data ?? null);
                this.loading.set(false);
            },
            error: (error) => {
                this.error.set(error?.error?.mensaje ?? 'No se pudo cargar el dashboard global');
                this.loading.set(false);
            }
        });
    }
}
