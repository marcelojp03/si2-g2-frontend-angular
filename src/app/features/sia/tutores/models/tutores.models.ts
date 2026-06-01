export interface TutorRequest {
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
}

export interface TutorResponse {
    id: string;
    idInstitucion: string;
    idUsuario?: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    estado: string;
    creadoEn?: string;
    actualizadoEn?: string;
}

// body para POST /api/estudiantes/{id}/tutores
export interface TutorEstudianteRequest {
    idTutor: string;
    parentesco?: string;
    esPrincipal?: boolean;
}

export interface TutorEstudianteResponse {
    id: string;
    idInstitucion: string;
    idEstudiante: string;
    idTutor: string;
    parentesco?: string;
    esPrincipal: boolean;
    estado: string;
    creadoEn: string;
}
