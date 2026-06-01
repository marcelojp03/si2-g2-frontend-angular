export interface CursoMateriaRequest {
    idMateria: string;
}

export interface CursoMateriaResponse {
    id: string;
    idInstitucion: string;
    idCurso: string;
    idMateria: string;
    estado: string;
    creadoEn: string;
}
