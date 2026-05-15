// ─── Archivo / Storage ───────────────────────────────────────────────────────
export interface ArchivoResponse {
    id: string;
    nombreOriginal: string;
    mimeType: string;
    tamanoBytes: number;
    extension: string;
    categoria: string;
    visibilidad: string;
    url: string;
    modulo: string;
    entidad: string;
    idEntidad: string;
    tipoReferencia: string;
    esPrincipal: boolean;
    creadoEn: string;
}

// ─── Configuración Institución ──────────────────────────────────────────────
export interface ConfiguracionInstitucionRequest {
    clave: string;
    valor: string;
    tipoValor?: string;
    descripcion?: string;
}

export interface ConfiguracionInstitucionResponse {
    id: string;
    idInstitucion: string;
    clave: string;
    valor: string;
    tipoValor: string;
    descripcion?: string;
}

export interface ConfiguracionParametroResponse {
    clave: string;
    nombre: string;
    modulo: string;
    descripcion: string;
    obligatorio: boolean;
    tipoValor: string;
    valor: string;
    valorPorDefecto: string;
    usaValorPorDefecto: boolean;
    minimo?: number;
    maximo?: number;
    valoresPermitidos: string[];
}

// ─── Curso-Materia ────────────────────────────────────────────────────────────
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

// ─── Instituciones ───────────────────────────────────────────────────────────
export interface InstitucionRequest {
    codigo?: string;
    nombre: string;
    tipoInstitucion?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
}

export interface InstitucionResponse {
    id: string;
    codigo?: string;
    nombre: string;
    tipoInstitucion?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    estado: string;
    creadoEn: string;
    actualizadoEn?: string;
}

// ─── Usuarios ────────────────────────────────────────────────────────────────
export interface UsuarioResponse {
    id: string;
    correo: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    idInstitucion?: string;
    roles: string[];
    estado: string;
    creadoEn: string;
}

export interface ActualizarUsuarioRequest {
    nombres: string;
    apellidos: string;
    telefono?: string;
}

export interface CrearUsuarioRequest {
    correo: string;
    contrasena: string;
    nombres: string;
    apellidos: string;
    idInstitucion?: string;
    idRol?: string;
    codigoRol?: string;
}

export interface AsignarRolRequest {
    idRol?: string;
    codigoRol?: string;
}

export interface PermisoResponse {
    id: string;
    codigo: string;
    nombre: string;
    modulo: string;
    accion: string;
    descripcion?: string;
}

export interface RolRequest {
    nombre: string;
    descripcion?: string;
    idsPermiso: string[];
}

export interface RolResponse {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    idInstitucion?: string;
    esGlobal: boolean;
    editable: boolean;
    permisos: PermisoResponse[];
}

export interface BitacoraAuditoriaResponse {
    id: string;
    idInstitucion?: string;
    idUsuario?: string;
    fechaEvento: string;
    direccionIp?: string;
    plataformaCliente?: string;
    agenteUsuario?: string;
    metodoHttp?: string;
    rutaRecurso?: string;
    nombreModulo: string;
    nombreFuncion?: string;
    nombreEntidad?: string;
    idEntidad?: string;
    tipoOperacion: string;
    datosAntes?: string;
    datosDespues?: string;
    exito: boolean;
    mensaje?: string;
    hashIntegridad?: string;
}

// ─── Gestión Académica ───────────────────────────────────────────────────────
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

// ─── Cursos ──────────────────────────────────────────────────────────────────
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

// ─── Paralelos ───────────────────────────────────────────────────────────────
export interface ParaleloRequest {
    idCurso: string;
    idGestion: string;
    nombre: string;
    capacidad?: number;
}

export interface ParaleloResponse {
    id: string;
    idInstitucion: string;
    idCurso: string;
    idGestion: string;
    nombre: string;
    capacidad?: number;
    estado: string;
}

// ─── Materias ────────────────────────────────────────────────────────────────
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

// ─── Docentes ────────────────────────────────────────────────────────────────
export interface DocenteRequest {
    codigo: string;
    documentoIdentidad: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    correo: string;
    especialidad?: string;
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
}

// ─── Estudiantes ─────────────────────────────────────────────────────────────
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

// ─── Tutores ─────────────────────────────────────────────────────────────────
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

// ─── Inscripciones ───────────────────────────────────────────────────────────
export interface InscripcionRequest {
    idEstudiante: string;
    idGestion: string;
    idCurso: string;
    idParalelo: string;
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

// ─── Asignaciones Docentes ───────────────────────────────────────────────────
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

export interface DashboardAction {
    codigo: string;
    titulo: string;
    descripcion: string;
    icono: string;
    ruta: string;
    severidad: string;
}

export interface DashboardAlert {
    id: string;
    modulo: string;
    severidad: string;
    titulo: string;
    detalle: string;
    rutaAccion: string;
    estado: string;
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

export interface DashboardDataset {
    label: string;
    data: number[];
    color: string;
}

export interface DashboardChart {
    codigo: string;
    titulo: string;
    tipo: string;
    labels: string[];
    datasets: DashboardDataset[];
}

export interface DashboardKpi {
    codigo: string;
    titulo: string;
    valor: string;
    subtitulo: string;
    icono: string;
    severidad: string;
    rutaAccion: string;
}

export interface DashboardFilterOption {
    valor: string;
    etiqueta: string;
    grupo?: string;
}

export interface DashboardCatalogoFiltrosResponse {
    gestiones: DashboardFilterOption[];
    cursos: DashboardFilterOption[];
    paralelos: DashboardFilterOption[];
    materias: DashboardFilterOption[];
    turnos: DashboardFilterOption[];
    periodos: DashboardFilterOption[];
}

export interface DashboardInstitucionInfo {
    id: string;
    codigo: string;
    nombre: string;
    tipoInstitucion: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
    estado: string;
    nombreCorto: string;
    colorPrimario: string;
    logoUrl?: string | null;
}

export interface DashboardRecentInstitution {
    id: string;
    codigo: string;
    nombre: string;
    tipoInstitucion: string;
    estado: string;
    direccion?: string;
    usuariosActivos: number;
    creadoEn: string;
}

export interface DashboardGlobalResponse {
    kpisGlobales: DashboardKpi[];
    institucionesPorTipo: DashboardChart;
    institucionesPorEstado: DashboardChart;
    altasPorMes: DashboardChart;
    alertasGlobales: DashboardAlert[];
    institucionesRecientes: DashboardRecentInstitution[];
    accesosRapidos: DashboardAction[];
    generadoEn: string;
}

export interface DashboardInstitucionalResponse {
    institucion: DashboardInstitucionInfo;
    gestionActiva?: GestionAcademicaResponse | null;
    filtrosAplicados: Record<string, string>;
    kpis: DashboardKpi[];
    graficos: DashboardChart[];
    alertas: DashboardAlert[];
    tareasPendientes: DashboardAction[];
    accesosRapidos: DashboardAction[];
    modulosDisponibles: string[];
    generadoEn: string;
}
