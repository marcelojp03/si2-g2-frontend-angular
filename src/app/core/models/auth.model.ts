export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginData {
    email: string;
    token: string;
}

export interface UsuarioSIA {
    correo: string;
    idInstitucion: string | null;
    roles: string[];
}

/** @deprecated Use UsuarioSIA */
export type UsuarioAuth = UsuarioSIA;
