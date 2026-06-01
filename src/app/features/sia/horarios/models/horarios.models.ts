export interface HorarioClaseRequest {
    idInstitucion: string;
    idAsignacionDocente: string;
    idAula: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}

export interface HorarioClaseResponse {
    id: string;
    idInstitucion: string;
    idAsignacionDocente: string;
    idAula: string;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
}
