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
