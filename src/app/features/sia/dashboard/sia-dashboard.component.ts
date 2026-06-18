import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { DashboardInstitucionalResponse } from '@/core/models/sia.models';
import { AuthService } from '@/core/services/auth.service';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardChartPanelComponent } from '@/shared/components/dashboard-chart-panel/dashboard-chart-panel.component';

@Component({
    selector: 'app-sia-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, SkeletonModule, ButtonModule, DashboardChartPanelComponent],
    templateUrl: './sia-dashboard.component.html'
})
export class SiaDashboardComponent implements OnInit {
    maxVal(dataset: { data: number[] }): number {
        return Math.max(...dataset.data, 1);
    }
    private dashboardService = inject(DashboardService);
    private authService = inject(AuthService);

    dashboard = signal<DashboardInstitucionalResponse | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    get roleLabel(): string {
        const roles = this.authService.getCurrentUser()?.roles ?? [];
        if (roles.includes('ADMIN_INSTITUCION')) return 'Administrador';
        if (roles.includes('DIRECTOR')) return 'Director';
        if (roles.includes('SECRETARIO')) return 'Secretario';
        if (roles.includes('DOCENTE')) return 'Docente';
        if (roles.includes('ESTUDIANTE')) return 'Estudiante';
        if (roles.includes('SUPER_ADMIN')) return 'Super Administrador';
        return '';
    }

    ngOnInit(): void {
        this.cargarDashboard();
    }

    cargarDashboard(): void {
        this.loading.set(true);
        this.error.set(null);
        this.dashboardService.getMiDashboard({}).subscribe({
            next: (response) => {
                this.dashboard.set(response.data ?? null);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar el dashboard');
                this.loading.set(false);
            }
        });
    }
}
