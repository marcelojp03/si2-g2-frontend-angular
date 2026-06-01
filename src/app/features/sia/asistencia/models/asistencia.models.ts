export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';

export type EstadoRegistroAsistencia = 'NO_REGISTRADA' | 'REGISTRADA' | 'MODIFICADA' | 'ANULADA';

export interface AsistenciaDetalleRequest {
    idInscripcion: string;
    estadoAsistencia: EstadoAsistencia;
}

export interface AsistenciaRegistroRequest {
    idAsignacionDocente: string;
    fecha: string;
    detalles: AsistenciaDetalleRequest[];
}

export interface AsistenciaAsignacionResponse {
    idAsignacionDocente: string;

    idDocente: string;
    codigoDocente: string;
    nombreDocente: string;

    idMateria: string;
    codigoMateria: string;
    nombreMateria: string;

    idParalelo: string;
    nombreParalelo: string;

    idCurso: string;
    nombreCurso: string;

    idGestion: string;
    nombreGestion: string;

    estado: string;
}

export interface AsistenciaEstudianteResponse {
    idDetalle?: string | null;
    idInscripcion: string;
    idEstudiante: string;

    codigoEstudiante: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;

    estadoAsistencia: EstadoAsistencia;
    registrado: boolean;
}

export interface AsistenciaPlantillaResponse {
    idAsistenciaRegistro?: string | null;
    idAsignacionDocente: string;
    fecha: string;
    estadoRegistro: EstadoRegistroAsistencia;
    registrada: boolean;

    asignacion: AsistenciaAsignacionResponse;
    estudiantes: AsistenciaEstudianteResponse[];

    totalEstudiantes: number;
}

export interface AsistenciaRegistroResponse {
    id: string;
    idInstitucion: string;
    idAsignacionDocente: string;
    registradoPor?: string | null;

    fecha: string;
    estado: EstadoRegistroAsistencia;

    asignacion: AsistenciaAsignacionResponse;
    detalles: AsistenciaEstudianteResponse[];

    totalPresentes: number;
    totalAusentes: number;
    totalTardanzas: number;
    totalJustificados: number;
    totalEstudiantes: number;

    creadoEn: string;
    actualizadoEn: string;
}
