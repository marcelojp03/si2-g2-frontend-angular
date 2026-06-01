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
