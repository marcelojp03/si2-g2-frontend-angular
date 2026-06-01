export interface GestionAcademicaRequest {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    activa?: boolean;
}

export interface GestionAcademicaResponse {
    id: string;
    idInstitucion: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    activa: boolean;
    estado: string;
    creadoEn: string;
}

export interface CursoRequest {
    codigo: string;
    nombre: string;
    nivel?: string;
}

export interface CursoResponse {
    id: string;
    idInstitucion: string;
    codigo: string;
    nombre: string;
    nivel?: string;
    estado: string;
}

export interface ParaleloRequest {
    idCurso: string;
    idGestionAcademica: string;
    nombre: string;
    capacidad?: number;
}

export interface ParaleloResponse {
    id: string;
    idInstitucion: string;
    idCurso: string;
    idGestionAcademica: string;
    nombre: string;
    capacidad?: number;
    estado: string;
}

export interface MateriaRequest {
    codigo: string;
    nombre: string;
    area?: string;
    cargaHoraria?: number;
}

export interface MateriaResponse {
    id: string;
    idInstitucion: string;
    codigo: string;
    nombre: string;
    area?: string;
    cargaHoraria?: number;
    estado: string;
}

export interface DocenteRequest {
    codigo: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    correo: string;
    especialidad?: string;
    idsMateria?: string[];
}

export interface DocenteResponse {
    id: string;
    idInstitucion: string;
    codigo: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    correo: string;
    especialidad?: string;
    estado: string;
    materias?: MateriaResponse[];
}

export interface EstudianteRequest {
    codigoEstudiante: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento?: string;
    sexo?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
}

export interface EstudianteResponse {
    id: string;
    idInstitucion: string;
    codigoEstudiante: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento?: string;
    sexo?: string;
    direccion?: string;
    telefono?: string;
    correo?: string;
    estado: string;
}

export interface AsignacionDocenteRequest {
    idDocente: string;
    idMateria: string;
    idParalelo: string;
    idGestion: string;
}

export interface AsignacionDocenteResponse {
    id: string;
    idInstitucion: string;
    idDocente: string;
    idMateria: string;
    idParalelo: string;
    idGestion: string;
    estado: string;
    creadoEn: string;
}

export interface AulaRequest {
    codigo: string;
    nombre: string;
    capacidad: number | null;
    ubicacion?: string;
    recursos: string[];
}

export interface AulaResponse {
    id: string;
    idInstitucion: string;
    codigo: string;
    nombre: string;
    capacidad: number;
    ubicacion?: string;
    recursos: string[];
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
}
