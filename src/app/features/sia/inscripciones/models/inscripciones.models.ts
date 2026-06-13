export interface InscripcionRequest {
    idEstudiante: string;
    idGestion: string;
    idCurso: string;
    idParalelo: string;
    idPlanPago?: string;
}

export interface InscripcionResponse {
    id: string;
    idInstitucion: string;
    idEstudiante: string;
    idGestion: string;
    idCurso: string;
    idParalelo: string;
    fechaInscripcion?: string;
    estado: string;
    creadoEn: string;
}
