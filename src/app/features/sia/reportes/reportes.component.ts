import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select, SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tabs, Tab, TabList, TabPanel, TabPanels } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import {
    QbeConditionRequest,
    QbeEntityDefinitionResponse,
    QbeFieldDefinitionResponse,
    QbePreviewRequest,
    ReporteMetadataResponse,
    ReporteNaturalLanguageRequest,
    ReportePreviewRequest,
    ReportePreviewResponse,
} from '@/core/models/reporte.models';
import { GestionAcademicaResponse, ParaleloResponse, CursoResponse } from '@/core/models/sia.models';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';
import { ParalelosService } from '@/features/sia/paralelos/services/paralelos.service';
import { CursosService } from '@/features/sia/cursos/services/cursos.service';
import { ReporteService } from './services/reporte.service';

type ReportMode = 'predefinido' | 'nl' | 'qbe';
type ExportKind = 'predefinido' | 'nl' | 'qbe';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputNumberModule, InputTextModule, SelectModule, Select, TableModule, Tabs, Tab, TabList, TabPanels, TabPanel, TagModule, TextareaModule, ToastModule],
    providers: [MessageService],
    templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {
    private static readonly NL_HISTORY_KEY = 'sia_reportes_nl_history';

    private reporteSvc = inject(ReporteService);
    private gestionesService = inject(GestionesService);
    private paralelosService = inject(ParalelosService);
    private cursosService = inject(CursosService);
    private toast = inject(MessageService);

    readonly mode = signal<ReportMode>('predefinido');
    readonly modeOptions = [
        { label: 'Predefinidos', value: 'predefinido' as const },
        { label: 'Lenguaje natural', value: 'nl' as const },
        { label: 'QBE', value: 'qbe' as const },
    ];

    gestiones = signal<GestionAcademicaResponse[]>([]);
    paralelos = signal<ParaleloResponse[]>([]);
    cursos = signal<CursoResponse[]>([]);

    idGestionSel: string | null = null;
    idParaleloSel: string | null = null;
    idCursoSel: string | null = null;

    datosAsistencia = signal<Record<string, unknown>[]>([]);
    datosCalificaciones = signal<Record<string, unknown>[]>([]);
    datosInscripciones = signal<Record<string, unknown>[]>([]);
    resumenGerencial = signal<Record<string, unknown> | null>(null);

    cargandoAsistencia = signal(false);
    cargandoCalificaciones = signal(false);
    cargandoInscripciones = signal(false);
    cargandoGerencial = signal(false);

    catalogo = signal<ReporteMetadataResponse[]>([]);
    qbeCatalogo = signal<QbeEntityDefinitionResponse[]>([]);
    selectedCodigo = signal<string | null>(null);
    selectedQbeEntity = signal<string | null>(null);
    preview = signal<ReportePreviewResponse | null>(null);
    filtros: Record<string, string | number | null> = {};
    consultaNatural = '';
    nlHistory = signal<string[]>([]);
    readonly nlExamples = [
        'Muéstrame los 10 alumnos con mejor promedio en matemáticas del segundo trimestre',
        'Top 5 cursos con peor asistencia este mes',
        'Matrícula por curso de los estudiantes activos',
        'Docentes agrupados por materia',
        'Muéstrame los tutores',
    ];
    qbeConditions: QbeConditionRequest[] = [];
    qbeSelectedColumns: string[] = [];
    loadingCatalogo = false;
    loadingPreview = false;
    exporting: string | null = null;
    page = 0;
    size = 25;
    lastExportContext: { kind: ExportKind; payload: ReportePreviewRequest | ReporteNaturalLanguageRequest | QbePreviewRequest; fileBase: string } | null = null;

    reportOptions = computed(() => this.catalogo().map(reporte => ({ label: reporte.nombre, value: reporte.codigo })));
    selectedReporte = computed(() => this.catalogo().find(reporte => reporte.codigo === this.selectedCodigo()) ?? null);
    qbeEntityOptions = computed(() => this.qbeCatalogo().map(entity => ({ label: entity.label, value: entity.entity })));
    selectedQbeDefinition = computed(() => this.qbeCatalogo().find(entity => entity.entity === this.selectedQbeEntity()) ?? null);
    qbeFieldOptions = computed(() => (this.selectedQbeDefinition()?.fields ?? []).map(field => ({ label: field.label, value: field.field })));

    ngOnInit(): void {
        this.loadNlHistory();
        this.gestionesService.listarGestiones().subscribe(r => { if (r?.codigo === 200) this.gestiones.set(r.data ?? []); });
        this.paralelosService.listarParalelos().subscribe(r => { if (r?.codigo === 200) this.paralelos.set(r.data ?? []); });
        this.cursosService.listarCursos().subscribe(r => { if (r?.codigo === 200) this.cursos.set(r.data ?? []); });
        this.cargarCatalogos();
    }

    cargarCatalogos(): void {
        this.loadingCatalogo = true;
        this.reporteSvc.catalogo().subscribe({
            next: response => {
                if (response.codigo === 200) this.catalogo.set(response.data ?? []);
                this.loadingCatalogo = false;
            },
            error: error => {
                this.loadingCatalogo = false;
                this.showError(error, 'No se pudo cargar el catálogo de reportes');
            }
        });
        this.reporteSvc.catalogoQbe().subscribe({
            next: response => { if (response.codigo === 200) this.qbeCatalogo.set(response.data ?? []); },
            error: error => this.showError(error, 'No se pudo cargar el catálogo QBE')
        });
    }

    setMode(mode: ReportMode): void { this.mode.set(mode); this.preview.set(null); this.page = 0; }
    onReporteChange(): void { this.preview.set(null); this.filtros = {}; this.page = 0; }
    onQbeEntityChange(): void { this.preview.set(null); this.qbeConditions = []; this.qbeSelectedColumns = []; }

    addQbeCondition(): void {
        const firstField = this.selectedQbeDefinition()?.fields[0];
        if (!firstField) return;
        this.qbeConditions = [...this.qbeConditions, { campo: firstField.field, operador: firstField.operators[0], valor: '', valorHasta: '' }];
    }

    removeQbeCondition(index: number): void { this.qbeConditions = this.qbeConditions.filter((_, current) => current !== index); }
    qbeField(fieldName: string): QbeFieldDefinitionResponse | undefined { return this.selectedQbeDefinition()?.fields.find(field => field.field === fieldName); }
    onQbeFieldChange(index: number): void {
        const field = this.qbeField(this.qbeConditions[index].campo);
        if (!field) return;
        this.qbeConditions = this.qbeConditions.map((condition, current) => current === index ? { ...condition, operador: field.operators[0], valor: '', valorHasta: '' } : condition);
    }
    qbeOperatorOptions(index: number): { label: string; value: string }[] { return (this.qbeField(this.qbeConditions[index]?.campo)?.operators ?? []).map(operator => ({ label: this.operatorLabel(operator), value: operator })); }
    needsSecondValue(operator: string): boolean { return ['BETWEEN', 'DATE_RANGE'].includes(operator); }

    generar(): void {
        switch (this.mode()) {
            case 'predefinido': this.generarPredefinido(); break;
            case 'nl': this.generarNaturalLanguage(); break;
            case 'qbe': this.generarQbe(); break;
        }
    }

    generarAsistencia(): void {
        if (!this.idGestionSel) return;
        this.cargandoAsistencia.set(true);
        this.reporteSvc.reporteAsistencia(this.idGestionSel, this.idParaleloSel ?? undefined).subscribe({
            next: r => { if (r?.codigo === 200) this.datosAsistencia.set(r.data ?? []); },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de asistencia' }),
            complete: () => this.cargandoAsistencia.set(false)
        });
    }

    generarCalificaciones(): void {
        if (!this.idGestionSel) return;
        this.cargandoCalificaciones.set(true);
        this.reporteSvc.reporteCalificaciones(this.idGestionSel, this.idParaleloSel ?? undefined).subscribe({
            next: r => { if (r?.codigo === 200) this.datosCalificaciones.set(r.data ?? []); },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de calificaciones' }),
            complete: () => this.cargandoCalificaciones.set(false)
        });
    }

    generarInscripciones(): void {
        if (!this.idGestionSel) return;
        this.cargandoInscripciones.set(true);
        this.reporteSvc.reporteInscripciones(this.idGestionSel, this.idCursoSel ?? undefined).subscribe({
            next: r => { if (r?.codigo === 200) this.datosInscripciones.set(r.data ?? []); },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte de inscripciones' }),
            complete: () => this.cargandoInscripciones.set(false)
        });
    }

    generarGerencial(): void {
        if (!this.idGestionSel) return;
        this.cargandoGerencial.set(true);
        this.reporteSvc.reporteGerencial(this.idGestionSel).subscribe({
            next: r => { if (r?.codigo === 200) this.resumenGerencial.set(r.data ?? null); },
            error: () => this.toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte gerencial' }),
            complete: () => this.cargandoGerencial.set(false)
        });
    }

    generarPredefinido(): void {
        const reporte = this.selectedReporte();
        if (!reporte) return;
        const missing = reporte.filtros.find(filter => filter.required && !this.filtros[filter.field]);
        if (missing) { this.toast.add({ severity: 'warn', summary: 'Filtro requerido', detail: `Complete el filtro: ${missing.label}`, life: 3500 }); return; }
        const payload = this.buildPredefinedRequest();
        this.loadingPreview = true;
        this.reporteSvc.preview(payload).subscribe({ next: response => this.consumePreview(response.data ?? null, 'predefinido', payload, reporte.nombre), error: error => this.failPreview(error, 'No se pudo generar el reporte predefinido') });
    }

    generarNaturalLanguage(): void {
        if (!this.consultaNatural.trim()) { this.toast.add({ severity: 'warn', summary: 'Consulta requerida', detail: 'Escriba una consulta en lenguaje natural', life: 3500 }); return; }
        const payload = this.buildNaturalLanguageRequest();
        this.rememberNlQuery(payload.consulta);
        this.loadingPreview = true;
        this.reporteSvc.previewNaturalLanguage(payload).subscribe({ next: response => this.consumePreview(response.data ?? null, 'nl', payload, 'reporte-lenguaje-natural'), error: error => this.failPreview(error, 'No se pudo interpretar la consulta en lenguaje natural') });
    }

    generarQbe(): void {
        if (!this.selectedQbeEntity()) { this.toast.add({ severity: 'warn', summary: 'Entidad requerida', detail: 'Seleccione una entidad para el reporte QBE', life: 3500 }); return; }
        const invalid = this.qbeConditions.find(condition => !condition.campo || !condition.operador || !condition.valor);
        if (invalid) { this.toast.add({ severity: 'warn', summary: 'Condición incompleta', detail: 'Complete las condiciones QBE antes de generar', life: 3500 }); return; }
        const payload = this.buildQbeRequest();
        this.loadingPreview = true;
        this.reporteSvc.previewQbe(payload).subscribe({ next: response => this.consumePreview(response.data ?? null, 'qbe', payload, `qbe-${this.selectedQbeEntity()}`), error: error => this.failPreview(error, 'No se pudo generar el reporte QBE') });
    }

    onLazyLoad(event: TableLazyLoadEvent): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? this.size;
        this.page = Math.floor(first / rows);
        this.size = rows;
        if (this.preview()) this.generar();
    }

    exportar(formato: string): void {
        if (!this.preview() || !this.lastExportContext) return;
        this.exporting = formato;
        const { kind, payload } = this.lastExportContext;
        const request = kind === 'predefinido'
            ? this.reporteSvc.exportar(formato, payload as ReportePreviewRequest)
            : kind === 'nl'
                ? this.reporteSvc.exportarNaturalLanguage(formato, payload as ReporteNaturalLanguageRequest)
                : this.reporteSvc.exportarQbe(formato, payload as QbePreviewRequest);
        request.subscribe({
            next: blob => { this.exporting = null; this.download(blob, this.fileName(formato, this.lastExportContext?.fileBase ?? 'reporte')); },
            error: error => { this.exporting = null; this.showError(error, `No se pudo exportar a ${formato}`); }
        });
    }

    value(row: Record<string, unknown>, field: string): string { const value = row[field]; return value === null || value === undefined ? '' : String(value); }
    pctClass(pct: unknown): string { const n = Number(pct); if (isNaN(n)) return ''; return n >= 75 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'; }
    toggleColumn(field: string, checked: boolean): void { this.qbeSelectedColumns = checked ? [...new Set([...this.qbeSelectedColumns, field])] : this.qbeSelectedColumns.filter(item => item !== field); }
    useNlExample(query: string): void { this.consultaNatural = query; }

    private buildPredefinedRequest(): ReportePreviewRequest { return { codigoReporte: this.selectedCodigo()!, filtros: this.cleanFiltros(), presentacion: { formato: 'HTML' }, page: this.page, size: this.size }; }
    private buildNaturalLanguageRequest(): ReporteNaturalLanguageRequest { return { consulta: this.consultaNatural.trim(), presentacion: { formato: 'HTML' }, page: this.page, size: this.size }; }
    private buildQbeRequest(): QbePreviewRequest { return { entidad: this.selectedQbeEntity()!, condiciones: this.qbeConditions.map(condition => ({ ...condition })), columnas: this.qbeSelectedColumns, presentacion: { formato: 'HTML' }, page: this.page, size: this.size }; }
    private cleanFiltros(): Record<string, string | number | null> { const clean: Record<string, string | number | null> = {}; Object.entries(this.filtros).forEach(([key, value]) => { if (value !== null && value !== undefined && String(value).trim() !== '') clean[key] = value; }); return clean; }
    private consumePreview(result: ReportePreviewResponse | null, kind: ExportKind, payload: ReportePreviewRequest | ReporteNaturalLanguageRequest | QbePreviewRequest, fileBase: string): void { this.loadingPreview = false; this.preview.set(result); this.lastExportContext = { kind, payload, fileBase }; }
    private failPreview(error: any, fallback: string): void { this.loadingPreview = false; this.showError(error, fallback); }
    private download(blob: Blob, fileName: string): void { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url); }
    private fileName(formato: string, baseName: string): string { const base = baseName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'reporte'; const extension = formato.toLowerCase() === 'xlsx' ? 'xlsx' : formato.toLowerCase(); return `${base}.${extension}`; }
    private operatorLabel(operator: string): string { const labels: Record<string, string> = { CONTAINS: 'Contiene', STARTS_WITH: 'Comienza con', EQUALS: 'Igual', NOT_EMPTY: 'No vacío', GT: 'Mayor que', LT: 'Menor que', BETWEEN: 'Entre', IN_LIST: 'En lista', DATE_RANGE: 'Rango fechas', BEFORE: 'Antes de', AFTER: 'Después de', MONTH_YEAR: 'Mes/año', TRUE: 'Verdadero', FALSE: 'Falso' }; return labels[operator] ?? operator; }
    private showError(error: any, fallback: string): void { this.toast.add({ severity: 'error', summary: 'Error', detail: error?.error?.mensaje ?? fallback, life: 4500 }); }
    private loadNlHistory(): void { try { const raw = localStorage.getItem(ReportesComponent.NL_HISTORY_KEY); this.nlHistory.set(raw ? JSON.parse(raw) : []); } catch { this.nlHistory.set([]); } }
    private rememberNlQuery(query: string): void { const history = [query, ...this.nlHistory().filter(item => item !== query)].slice(0, 8); this.nlHistory.set(history); try { localStorage.setItem(ReportesComponent.NL_HISTORY_KEY, JSON.stringify(history)); } catch {} }
}
