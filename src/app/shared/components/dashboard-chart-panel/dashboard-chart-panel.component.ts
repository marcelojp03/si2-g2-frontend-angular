import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardChart } from '@/core/models/sia.models';

type DashboardChartType = 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar';

@Component({
    selector: 'app-dashboard-chart-panel',
    standalone: true,
    imports: [CommonModule, ChartModule],
    template: `
        <div class="rounded-lg border border-surface-200 bg-white dark:bg-surface-900 p-4 h-full">
            <div class="mb-4">
                <h3 class="text-base font-semibold m-0 text-surface-900 dark:text-surface-0">{{ chart?.titulo }}</h3>
                <p class="text-xs text-surface-500 mt-1 mb-0">{{ chart?.labels?.length ?? 0 }} elementos visibles</p>
            </div>
            @if (chart?.labels?.length) {
                <p-chart [type]="chartType" [data]="chartData" [options]="chartOptions" styleClass="w-full h-20rem block"></p-chart>
            } @else {
                <div class="h-20rem flex items-center justify-center text-sm text-surface-400">Sin datos para graficar.</div>
            }
        </div>
    `
})
export class DashboardChartPanelComponent implements OnChanges {
    @Input() chart: DashboardChart | null = null;

    chartData: any;
    chartOptions: any;
    chartType: DashboardChartType = 'bar';

    ngOnChanges(): void {
        this.chartType = this.resolveType(this.chart?.tipo);
        const labels = this.chart?.labels ?? [];
        const datasets = this.chart?.datasets ?? [];
        this.chartData = {
            labels,
            datasets: datasets.map((dataset, index) => {
                const colors = this.resolveColors(dataset.color, labels.length, index);
                const usePerItemColors = this.usesSegmentColors() || this.shouldUsePerBarColors(datasets.length, labels.length);
                return {
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: usePerItemColors ? colors : dataset.color,
                    borderColor: usePerItemColors ? colors : dataset.color,
                    hoverBackgroundColor: usePerItemColors ? colors : dataset.color,
                    borderRadius: this.usesSegmentColors() ? 0 : 6,
                    tension: 0.35,
                    fill: this.chartType === 'line',
                    borderWidth: usePerItemColors ? 1 : 0
                };
            })
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#64748b'
                    }
                }
            },
            scales: this.chart?.tipo === 'pie' || this.chart?.tipo === 'doughnut' ? undefined : {
                x: {
                    ticks: { color: '#64748b' },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' }
                }
            }
        };
    }

    private resolveType(type?: string): DashboardChartType {
        const allowed: DashboardChartType[] = ['bar', 'line', 'scatter', 'bubble', 'pie', 'doughnut', 'polarArea', 'radar'];
        return allowed.includes(type as DashboardChartType) ? (type as DashboardChartType) : 'bar';
    }

    private usesSegmentColors(): boolean {
        return this.chartType === 'pie' || this.chartType === 'doughnut' || this.chartType === 'polarArea';
    }

    private shouldUsePerBarColors(datasetCount: number, labelCount: number): boolean {
        return this.chartType === 'bar' && datasetCount === 1 && labelCount > 1;
    }

    private resolveColors(baseColor: string, count: number, datasetIndex: number): string[] {
        const palettes = [
            ['#0f766e', '#2563eb', '#ea580c', '#7c3aed', '#dc2626', '#0891b2', '#65a30d', '#d97706'],
            ['#1d4ed8', '#16a34a', '#f59e0b', '#db2777', '#7c3aed', '#0d9488', '#b91c1c', '#4338ca'],
            ['#1f2937', '#475569', '#0284c7', '#65a30d', '#d97706', '#be123c', '#0f766e', '#7c2d12']
        ];
        const selected = palettes[datasetIndex % palettes.length];
        const result: string[] = [];
        for (let i = 0; i < count; i++) {
            result.push(selected[i % selected.length] || baseColor);
        }
        return result;
    }
}
