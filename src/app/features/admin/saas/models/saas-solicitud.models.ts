export interface SolicitudOnboardingRequest {
    nombreInstitucion: string;
    tipoInstitucion: string;
    telefonoInstitucion?: string;
    correoInstitucion?: string;
    direccionInstitucion?: string;
    nombresContacto: string;
    apellidosContacto: string;
    correoContacto: string;
    telefonoContacto?: string;
    idPlan: string;
    mensaje?: string;
}

export interface SolicitudOnboardingResponse {
    id: string;
    nombreInstitucion: string;
    tipoInstitucion: string;
    telefonoInstitucion?: string;
    correoInstitucion?: string;
    direccionInstitucion?: string;
    nombresContacto: string;
    apellidosContacto: string;
    correoContacto: string;
    telefonoContacto?: string;
    idPlan: string;
    nombrePlan: string;
    mensaje?: string;
    estado: string;
    notasAdmin?: string;
    idInstitucionCreada?: string;
    idUsuarioCreado?: string;
    creadoEn: string;
    actualizadoEn: string;
}

export interface PagoSuscripcionResponse {
    id: string;
    idSolicitud: string;
    idPlan: string;
    monto: number;
    moneda: string;
    metodoPago: string;
    proveedor: string;
    referenciaExterna?: string;
    qrBase64?: string;
    estado: string;
    glosa?: string;
    fechaExpiracion?: string;
    pagadoEn?: string;
    creadoEn: string;
}

export interface EstadoPagoResponse {
    idPago: string;
    idQr?: string;
    estadoVpay: string;
    pagado: boolean;
    estadoPago: string;
}
