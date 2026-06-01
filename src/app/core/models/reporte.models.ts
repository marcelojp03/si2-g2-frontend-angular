export interface ReporteFilterOptionResponse {
    value: string;
    label: string;
}

export interface ReporteFilterDefinitionResponse {
    field: string;
    label: string;
    type: 'uuid' | 'text' | 'number' | 'date';
    required: boolean;
    options: ReporteFilterOptionResponse[];
}

export interface ReporteMetadataResponse {
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo: 'PREDEFINIDO' | 'ANALITICO' | 'DINAMICO';
    grafico: boolean;
    filtros: ReporteFilterDefinitionResponse[];
    formatosExportacion: string[];
}

export interface ReportePresentacionRequest {
    formato?: string;
    tipoGrafico?: string;
    ejeX?: string;
    ejeY?: string;
    agrupacion?: string;
    series?: string[];
    mostrarLeyenda?: boolean;
    mostrarEtiquetas?: boolean;
}

export interface ReportePreviewRequest {
    codigoReporte: string;
    filtros: Record<string, string | number | null>;
    presentacion?: ReportePresentacionRequest;
    page: number;
    size: number;
}

export interface ReporteHeaderResponse {
    nombreReporte: string;
    generadoEn: string;
    usuario: string;
    filtrosAplicados: string[];
}

export interface ReporteColumnResponse {
    field: string;
    header: string;
    type: 'text' | 'number' | 'date';
}

export interface ReportePreviewResponse {
    encabezado: ReporteHeaderResponse;
    columnas: ReporteColumnResponse[];
    filas: Record<string, unknown>[];
    totalRegistros: number;
    page: number;
    size: number;
}

export interface ReporteNaturalLanguageRequest {
    consulta: string;
    presentacion?: ReportePresentacionRequest;
    page: number;
    size: number;
}

export interface QbeConditionRequest {
    campo: string;
    operador: string;
    valor: string;
    valorHasta?: string | null;
}

export interface QbePreviewRequest {
    entidad: string;
    condiciones: QbeConditionRequest[];
    columnas: string[];
    presentacion?: ReportePresentacionRequest;
    page: number;
    size: number;
}

export interface QbeFieldDefinitionResponse {
    field: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    operators: string[];
}

export interface QbeEntityDefinitionResponse {
    entity: string;
    label: string;
    fields: QbeFieldDefinitionResponse[];
}
