import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ReporteService } from './services/reporte.service';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule, TableModule, TagModule, TextareaModule, ToastModule],
    providers: [MessageService],
    templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {
    private static readonly NL_HISTORY_KEY = 'sia_reportes_nl_history';

    private reporteSvc = inject(ReporteService);
    private toast = inject(MessageService);

    consultaNatural = '';
    nlHistory = signal<string[]>([]);
    preview = signal<ReportePreviewResponse | null>(null);
    interpretacion = signal<string | null>(null);
    loadingPreview = false;
    _aiResult = false;

    readonly nlExamples = [
        'Muéstrame los 10 alumnos con mejor promedio en matemáticas del segundo trimestre',
        'Top 5 cursos con peor asistencia este mes',
        'Matrícula por curso de los estudiantes activos',
        'Docentes agrupados por materia',
        'Cuántos estudiantes tiene el colegio?',
    ];

    page = 0;
    size = 25;

    ngOnInit(): void {
        this.loadNlHistory();
    }

    // ── Consulta IA ──────────────────────────────────────────────────────────

    generarConsultaNaturalIA(): void {
        if (!this.consultaNatural.trim()) {
            this.toast.add({ severity: 'warn', summary: 'Consulta requerida', detail: 'Escriba una consulta', life: 3500 });
            return;
        }
        this.rememberNlQuery(this.consultaNatural.trim());
        this._aiResult = true;
        this.loadingPreview = true;
        this.reporteSvc.consultaNatural(this.consultaNatural.trim()).subscribe({
            next: response => {
                this.loadingPreview = false;
                if (response.codigo === 200 && response.data) {
                    const d = response.data;
                    this.interpretacion.set(d.interpretacion ?? null);
                    const filas: Record<string, unknown>[] = (d.filas ?? []).map(fila => {
                        const row: Record<string, unknown> = {};
                        d.columnas.forEach((col, j) => { row[col] = fila[j] ?? ''; });
                        return row;
                    });
                    this.preview.set({
                        encabezado: {
                            nombreReporte: this.consultaNatural.trim(),
                            usuario: 'IA',
                            generadoEn: new Date().toISOString(),
                            filtrosAplicados: d.sqlGenerado ? ['SQL: ' + d.sqlGenerado] : [],
                        },
                        columnas: d.columnas.map(c => ({ field: c, header: c, type: 'text' as const })),
                        filas,
                        totalRegistros: d.total,
                        page: 0,
                        size: d.total || 25,
                    });
                }
            },
            error: () => {
                this.loadingPreview = false;
                this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo ejecutar la consulta', life: 4500 });
            }
        });
    }

    // ── Tabla lazy ───────────────────────────────────────────────────────────

    onLazyLoad(event: TableLazyLoadEvent): void {
        if (this._aiResult) return;
        const first = event.first ?? 0;
        const rows = event.rows ?? this.size;
        this.page = Math.floor(first / rows);
        this.size = rows;
    }

    // ── Exportar ─────────────────────────────────────────────────────────────

    exportarExcel(): void {
        const p = this.preview();
        if (!p || !p.filas.length) return;
        const cols = p.columnas.map(c => c.header);
        const rows = p.filas.map(r => {
            const cells = cols.map(c => {
                const v = r[c];
                const s = v === null || v === undefined ? '' : String(v);
                return `<td>${s.replace(/</g, '&lt;')}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        const headers = cols.map(c => `<th>${c}</th>`).join('');
        const html = `<html><head><meta charset="utf-8"><title>Reporte</title></head><body><table>${headers}${rows}</table></body></html>`;
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'reporte-ia.xls'; a.click();
        URL.revokeObjectURL(url);
    }

    exportarPDF(): void {
        window.print();
    }

    // ── Utils ────────────────────────────────────────────────────────────────

    useNlExample(query: string): void { this.consultaNatural = query; }

    value(row: Record<string, unknown>, field: string): string {
        const v = row[field];
        return v === null || v === undefined ? '' : String(v);
    }

    private loadNlHistory(): void {
        try { const raw = localStorage.getItem(ReportesComponent.NL_HISTORY_KEY); this.nlHistory.set(raw ? JSON.parse(raw) : []); }
        catch { this.nlHistory.set([]); }
    }

    private rememberNlQuery(query: string): void {
        const h = [query, ...this.nlHistory().filter(i => i !== query)].slice(0, 8);
        this.nlHistory.set(h);
        try { localStorage.setItem(ReportesComponent.NL_HISTORY_KEY, JSON.stringify(h)); } catch {}
    }
}

interface ReportePreviewResponse {
    encabezado: { nombreReporte: string; generadoEn: string; usuario: string; filtrosAplicados: string[] };
    columnas: { field: string; header: string; type: string }[];
    filas: Record<string, unknown>[];
    totalRegistros: number;
    page: number;
    size: number;
}
