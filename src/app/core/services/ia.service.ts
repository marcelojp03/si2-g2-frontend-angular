import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface RiesgoEstudianteRequest {
  id_estudiante: string;
  porcentaje_asistencia: number;
  promedio_calificaciones: number;
  evaluaciones_pendientes: number;
  materias_reprobadas_historial: number;
}

export interface RiesgoEstudianteResponse {
  id_estudiante: string;
  nivel_riesgo: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  probabilidad_riesgo: number;
  factores_principales: string[];
}

export interface FiltroReporte {
  campo: string;
  operador: 'EQ' | 'CONTAINS' | 'GT' | 'LT' | 'BETWEEN' | 'IN';
  valor: string | string[];
}

export interface InterpretacionIaRequest {
  texto: string;
  entidad: 'asistencia' | 'calificacion' | 'inscripcion';
}

export interface InterpretacionIaResponse {
  filtros: FiltroReporte[];
  columnas_sugeridas: string[];
  confianza: number;
  texto_original: string;
}

@Injectable({ providedIn: 'root' })
export class IaService {
  private http = inject(HttpClient);
  private base = `${environment.api.baseUrl}/ia`;

  /**
   * Predice el nivel de riesgo académico para una lista de estudiantes.
   * El JWT se adjunta automáticamente via el interceptor oauth2.interceptor.
   */
  predecirRiesgo(
    estudiantes: RiesgoEstudianteRequest[]
  ): Observable<ApiResponse<RiesgoEstudianteResponse[]>> {
    return this.http.post<ApiResponse<RiesgoEstudianteResponse[]>>(
      `${this.base}/riesgo/predecir`,
      estudiantes
    );
  }

  /**
   * Interpreta una consulta en lenguaje natural y devuelve filtros de reporte.
   */
  interpretarConsulta(
    request: InterpretacionIaRequest
  ): Observable<ApiResponse<InterpretacionIaResponse>> {
    return this.http.post<ApiResponse<InterpretacionIaResponse>>(
      `${this.base}/reporte/interpretar`,
      request
    );
  }
}
