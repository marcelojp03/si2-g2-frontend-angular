export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginData {
    email: string;
    token: string;
}

export interface PasswordRecoveryRequest {
    correo: string;
}

export interface PasswordRecoveryVerifyRequest {
    challengeId: string;
    codigoVerificacion: string;
}

export interface PasswordResetRequest {
    challengeId: string;
    recoveryToken: string;
    nuevaContrasena: string;
}

export interface PasswordRecoveryData {
    mensaje: string;
    challengeId?: string;
    recoveryToken?: string;
    codigoVerificacionDebug?: string;
}

export interface UsuarioSIA {
    correo: string;
    idInstitucion: string | null;
    roles: string[];
    permisos: string[];
}

/** @deprecated Use UsuarioSIA */
export type UsuarioAuth = UsuarioSIA;
