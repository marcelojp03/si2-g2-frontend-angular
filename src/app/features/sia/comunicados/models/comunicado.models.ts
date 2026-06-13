export interface ComunicadoRequest {
    titulo: string;
    contenido: string;
    tipo?: string;
    destinatarios?: string;
}

export interface ComunicadoResponse {
    id: string;
    idInstitucion: string;
    titulo: string;
    contenido: string;
    tipo: string;
    destinatarios: string;
    estado: string;
    publicadoEn?: string;
    publicadoPor?: string;
    creadoPor: string;
    creadoEn: string;
    actualizadoEn: string;
}
