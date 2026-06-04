export interface DimensionResponse {
    id: string;
    idInstitucion?: string | null;
    nombre: string;
    descripcion?: string;
    pesoDefault: number;
    estado: string;
    esGlobal: boolean;
    creadoEn?: string;
    actualizadoEn?: string;
}

export interface DimensionRequest {
    nombre: string;
    descripcion?: string;
    pesoDefault?: number;
}

export interface PeriodoDimensionRequest {
    idDimension: string;
    ponderacion: number;
}

export interface PeriodoDimensionResponse {
    id: string;
    idPeriodoEvaluacion: string;
    idDimension: string;
    nombreDimension: string;
    ponderacion: number;
}

export interface SolicitudEliminacionRequest {
    idDimension: string;
    observacion?: string;
}

export interface SolicitudEliminacionResponse {
    id: string;
    idInstitucion: string;
    idPeriodoEvaluacion: string;
    idDimension: string;
    estado: string;
    idUsuarioSolicitud: string;
    fechaSolicitud: string;
    idUsuarioResolucion?: string;
    fechaResolucion?: string;
    observacion?: string;
}
