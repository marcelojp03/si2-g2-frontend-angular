import { GestionAcademicaResponse } from './academico.models';

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
