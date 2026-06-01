export type EscalaEvaluacion = 'NUMERICA' | 'LITERAL';
export type EstadoEvaluacion = 'ABIERTA' | 'CERRADA' | 'ANULADA';

export interface CalificacionAsignacionResponse {
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

export interface EvaluacionRequest {
    idMateria: string;
    periodo: number;
    tipo: string;
    nombre: string;
    ponderacion: number;
    escala?: EscalaEvaluacion;
    estado?: EstadoEvaluacion;
}

export interface EvaluacionResponse {
    id: string;
    idInstitucion: string;
    idMateria: string;
    creadoPor?: string | null;
    periodo: number;
    tipo: string;
    nombre: string;
    ponderacion: number;
    escala: EscalaEvaluacion;
    estado: EstadoEvaluacion;
    creadoEn: string;
    actualizadoEn: string;
}

export interface CalificacionDetalleRequest {
    idInscripcion: string;
    notaNumerica?: number | null;
    notaLiteral?: string | null;
    razonCambio?: string | null;
}

export interface CalificacionRegistroRequest {
    idEvaluacion: string;
    detalles: CalificacionDetalleRequest[];
}

export interface CalificacionEstudianteResponse {
    idCalificacion?: string | null;
    idInscripcion: string;
    idEstudiante: string;
    codigoEstudiante: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    notaNumerica?: number | null;
    notaLiteral?: string | null;
    registrado: boolean;
}

export interface CalificacionPlantillaResponse {
    idEvaluacion: string;
    evaluacion: EvaluacionResponse;
    asignacion: CalificacionAsignacionResponse;
    estudiantes: CalificacionEstudianteResponse[];
    totalEstudiantes: number;
    escalaMaxima: number;
    puedeEditar: boolean;
}

export interface CalificacionResumenEstudianteResponse {
    idInscripcion: string;
    idEstudiante: string;
    codigoEstudiante: string;
    nombreCompleto: string;
    notaConsolidada: number;
    ponderacionRegistrada: number;
    estadoAcademico: string;
}

export interface CalificacionResumenResponse {
    idAsignacionDocente: string;
    periodo: number;
    ponderacionTotal: number;
    notaMinimaAprobacion: number;
    evaluaciones: EvaluacionResponse[];
    estudiantes: CalificacionResumenEstudianteResponse[];
}

// ─── Calificaciones Trimestrales ────────────────────────────────────────────

export interface PeriodoTrimestralResponse {
    id: string;
    idInstitucion: string;
    idGestionAcademica: string;
    numeroTrimestre: number;
    estado: string;
    fechaCierre?: string | null;
    justificacionCierre?: string | null;
    idUsuarioCierre?: string | null;
    fechaReapertura?: string | null;
    justificacionReapertura?: string | null;
    idUsuarioReapertura?: string | null;
    creadoEn: string;
    actualizadoEn: string;
}

export interface ActividadEvaluativaRequest {
    idGestionAcademica: string;
    trimestre: number;
    idCurso: string;
    idParalelo: string;
    idMateria: string;
    idDocente: string;
    nombreActividad: string;
    tipoActividad: string;
    dimension: string;
    fechaActividad?: string | null;
    descripcion?: string | null;
    estado?: string | null;
}

export interface ActividadEvaluativaResponse {
    id: string;
    idPeriodoTrimestral: string;
    idGestionAcademica: string;
    idCurso: string;
    idParalelo: string;
    idMateria: string;
    idDocente: string;
    nombreActividad: string;
    tipoActividad: string;
    dimension: string;
    puntajeMaximo: number;
    fechaActividad: string;
    descripcion?: string | null;
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
}

export interface CalificacionActividadDetalleRequest {
    idEstudiante: string;
    notaObtenida?: number | null;
    observacion?: string | null;
}

export interface CalificacionActividadRegistroRequest {
    idActividad: string;
    detalles: CalificacionActividadDetalleRequest[];
}

export interface CalificacionActividadResponse {
    id?: string | null;
    idActividad: string;
    idEstudiante: string;
    notaObtenida?: number | null;
    observacion?: string | null;
    estado: string;
    idUsuarioRegistro?: string | null;
    idUsuarioModificacion?: string | null;
    creadoEn?: string | null;
    actualizadoEn?: string | null;
}

export interface CalificacionSerRequest {
    idGestionAcademica: string;
    trimestre: number;
    idCurso: string;
    idParalelo: string;
    idMateria: string;
    idDocente: string;
    idEstudiante: string;
    notaSer: number;
    observacion?: string | null;
}

export interface CalificacionSerResponse {
    id: string;
    idGestionAcademica: string;
    idTrimestre: string;
    idCurso: string;
    idParalelo: string;
    idMateria: string;
    idDocente: string;
    idEstudiante: string;
    notaSer: number;
    observacion?: string | null;
    estado: string;
    idUsuarioRegistro?: string | null;
    idUsuarioModificacion?: string | null;
    creadoEn: string;
    actualizadoEn: string;
}

export interface AutoevaluacionTrimestralRequest {
    idGestionAcademica: string;
    trimestre: number;
    idMateria: string;
    idEstudiante: string;
    notaAutoevaluacion: number;
    comentario?: string | null;
}

export interface AutoevaluacionTrimestralResponse {
    id: string;
    idGestionAcademica: string;
    idTrimestre: string;
    idMateria: string;
    idEstudiante: string;
    notaAutoevaluacion: number;
    comentario?: string | null;
    estado: string;
    idUsuarioRegistro?: string | null;
    idUsuarioModificacion?: string | null;
    creadoEn: string;
    actualizadoEn: string;
}

export interface ConsolidadoTrimestralEstudianteResponse {
    idEstudiante: string;
    codigoEstudiante: string;
    nombreCompleto: string;
    ser: number;
    promedioSaber: number;
    promedioHacer: number;
    autoevaluacion: number;
    totalParcial: number;
    totalFinal: number;
    estado: string;
    observacion?: string | null;
}

export interface ConsolidadoTrimestralMateriaResponse {
    idMateria: string;
    codigoMateria: string;
    nombreMateria: string;
    idDocente: string;
    nombreDocente: string;
    actividadesSaber: number;
    actividadesHacer: number;
    estudiantesPendientesAutoevaluacion: number;
    promedioGeneral: number;
    estado: string;
    estudiantes: ConsolidadoTrimestralEstudianteResponse[];
}

export interface ConsolidadoTrimestralDirectorResponse {
    totalMaterias: number;
    materiasCompletas: number;
    materiasConPendientes: number;
    estudiantesSinAutoevaluacion: number;
    docentesConSerPendiente: number;
    estudiantesEnRiesgo: number;
    promedioGeneral: number;
    materias: ConsolidadoTrimestralMateriaResponse[];
}
