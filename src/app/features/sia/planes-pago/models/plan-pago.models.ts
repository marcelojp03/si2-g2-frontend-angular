export interface PlanPagoRequest {
    nombre: string;
    tipoPeriodo: string;
    monto: number | null;
    moneda?: string;
    cantidadCuotas: number | null;
    diaVencimiento?: number | null;
    descripcion?: string;
}

export interface PlanPagoResponse {
    id: string;
    idInstitucion: string;
    nombre: string;
    tipoPeriodo: string;
    monto: number;
    moneda: string;
    cantidadCuotas: number;
    diaVencimiento: number;
    descripcion?: string;
    activo: boolean;
    creadoEn: string;
    actualizadoEn: string;
}

export interface CuotaEstudianteResponse {
    id: string;
    idEstudiante: string;
    idPlanPago: string;
    nombrePlan: string;
    idGestionAcademica: string;
    numeroCuota: number;
    monto: number;
    fechaVencimiento: string;
    estado: string;
    creadoEn: string;
    ultimoPago?: PagoResponse;
}

export interface PagoResponse {
    id: string;
    idCuota: string;
    idUsuarioPaga: string;
    monto: number;
    moneda: string;
    metodoPago: string;
    proveedor?: string;
    referenciaExterna?: string;
    qrBase64?: string;
    estado: string;
    pagadoEn?: string;
    creadoEn: string;
}

export interface RegistrarPagoRequest {
    idCuota: string;
    monto: number;
    metodoPago?: string;
    proveedor?: string;
    referenciaExterna?: string;
    qrBase64?: string;
}
