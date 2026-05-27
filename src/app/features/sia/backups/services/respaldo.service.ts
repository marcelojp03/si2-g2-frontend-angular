import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';

export interface RegistroRespaldo {
  id: string;
  idInstitucion: string;
  tipoRespaldo: string;
  estado: string;
  iniciadoPor: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  rutaAlmacenamiento: string | null;
  tamanioBytes: number | null;
  observacion: string | null;
  simulado: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface RegistroRestauracion {
  id: string;
  idRespaldo: string;
  idInstitucion: string;
  solicitadoPor: string | null;
  aprobadoPor: string | null;
  fechaSolicitud: string;
  fechaEjecucion: string | null;
  estado: string;
  motivo: string;
  observacion: string | null;
  simulado: boolean;
}

@Injectable({ providedIn: 'root' })
export class RespaldoService {
  private http = inject(HttpClient);
  private base = environment.api.baseUrl;

  listarRespaldos(): Observable<ApiResponse<RegistroRespaldo[]>> {
    return this.http.get<ApiResponse<RegistroRespaldo[]>>(`${this.base}/respaldos`);
  }

  iniciarRespaldo(): Observable<ApiResponse<RegistroRespaldo>> {
    return this.http.post<ApiResponse<RegistroRespaldo>>(`${this.base}/respaldos`, {});
  }

  listarRestauraciones(): Observable<ApiResponse<RegistroRestauracion[]>> {
    return this.http.get<ApiResponse<RegistroRestauracion[]>>(`${this.base}/restauraciones`);
  }

  solicitarRestauracion(idRespaldo: string, motivo: string): Observable<ApiResponse<RegistroRestauracion>> {
    return this.http.post<ApiResponse<RegistroRestauracion>>(
      `${this.base}/restauraciones`,
      { idRespaldo, motivo }
    );
  }

  aprobarRestauracion(id: string): Observable<ApiResponse<RegistroRestauracion>> {
    return this.http.put<ApiResponse<RegistroRestauracion>>(
      `${this.base}/restauraciones/${id}/aprobar`,
      {}
    );
  }
}
