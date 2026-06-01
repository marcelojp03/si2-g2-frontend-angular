import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';

export interface ConsultaNaturalResponse {
  sqlGenerado: string;
  columnas: string[];
  filas: (string | null)[][];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private base = environment.api.baseUrl;

  reporteAsistencia(idGestion: string, idParalelo?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
    let params = new HttpParams().set('idGestion', idGestion);
    if (idParalelo) params = params.set('idParalelo', idParalelo);
    return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/reportes/asistencia`, { params });
  }

  reporteCalificaciones(idGestion: string, idParalelo?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
    let params = new HttpParams().set('idGestion', idGestion);
    if (idParalelo) params = params.set('idParalelo', idParalelo);
    return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/reportes/calificaciones`, { params });
  }

  reporteInscripciones(idGestion: string, idCurso?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
    let params = new HttpParams().set('idGestion', idGestion);
    if (idCurso) params = params.set('idCurso', idCurso);
    return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/reportes/inscripciones`, { params });
  }

  reporteGerencial(idGestion: string): Observable<ApiResponse<Record<string, unknown>>> {
    const params = new HttpParams().set('idGestion', idGestion);
    return this.http.get<ApiResponse<Record<string, unknown>>>(`${this.base}/reportes/gerencial`, { params });
  }

  consultaNatural(consulta: string, limite = 100): Observable<ApiResponse<ConsultaNaturalResponse>> {
    return this.http.post<ApiResponse<ConsultaNaturalResponse>>(
      `${this.base}/ia/reporte/consulta-natural`,
      { consulta, limite }
    );
  }
}
