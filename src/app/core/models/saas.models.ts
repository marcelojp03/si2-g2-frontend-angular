export interface ModuloSistemaResponse {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    icono?: string;
    rutaFrontend?: string;
    ordenVisual: number;
    estado: string;
}

export interface PlanSuscripcionRequest {
    codigo: string;
    nombre: string;
    descripcion?: string;
    maxUsuarios: number;
    maxAlmacenamientoMb: number;
    precioMensual: number;
    idModulos: string[];
}

export interface PlanSuscripcionResponse {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    maxUsuarios: number;
    maxAlmacenamientoMb: number;
    precioMensual: number;
    estado: string;
    modulos: ModuloSistemaResponse[];
}

export interface SuscripcionInstitucionRequest {
    idPlan: string;
    fechaInicio: string;
    fechaFin?: string;
    observacion?: string;
}

export interface SuscripcionInstitucionResponse {
    id: string;
    idInstitucion: string;
    plan: PlanSuscripcionResponse;
    fechaInicio: string;
    fechaFin?: string;
    estado: string;
    simulada: boolean;
    observacion?: string;
    creadoEn: string;
}

export interface IntentoLoginResponse {
    id: string;
    correo: string;
    idUsuario?: string;
    idInstitucion?: string;
    fechaIntento: string;
    exito: boolean;
    ip?: string;
    motivoFallo?: string;
}
