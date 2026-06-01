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
