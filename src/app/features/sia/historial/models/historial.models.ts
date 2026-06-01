export interface HistorialEvaluacionResponse {
    id: string;
    nombre: string;
    tipo: string;
    periodo: number;
    notaNumerica?: number | null;
    notaLiteral?: string | null;
    ponderacion: number;
}

export interface HistorialMateriaResponse {
    idMateria: string;
    codigoMateria: string;
    nombreMateria: string;
    idAsignacion: string;
    promedioGeneral: number | null;
    totalSesiones: number;
    sesionesPresente: number;
    porcentajeAsistencia: number | null;
    evaluaciones: HistorialEvaluacionResponse[];
}

export interface HistorialGestionResponse {
    idGestion: string;
    nombreGestion: string;
    idParalelo: string;
    nombreParalelo: string;
    idInscripcion: string;
    estadoInscripcion: string;
    fechaInscripcion: string;
    materias: HistorialMateriaResponse[];
}

export interface HistorialAcademicoResponse {
    idEstudiante: string;
    codigoEstudiante: string;
    nombres: string;
    apellidos: string;
    gestiones: HistorialGestionResponse[];
}
