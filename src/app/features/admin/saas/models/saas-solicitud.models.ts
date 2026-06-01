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
