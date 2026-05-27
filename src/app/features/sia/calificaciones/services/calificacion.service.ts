import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import {
    CalificacionAsignacionResponse,
    CalificacionPlantillaResponse,
    CalificacionRegistroRequest,
    CalificacionResumenResponse,
    EvaluacionRequest,
    EvaluacionResponse,
} from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarMisAsignaciones(): Observable<ApiResponse<CalificacionAsignacionResponse[]>> {
        return this.http.get<ApiResponse<CalificacionAsignacionResponse[]>>(
            `${this.base}/calificaciones/mis-asignaciones`
        );
    }

    listarEvaluaciones(idAsignacionDocente: string, periodo?: number): Observable<ApiResponse<EvaluacionResponse[]>> {
        let params = new HttpParams().set('idAsignacionDocente', idAsignacionDocente);
        if (periodo) {
            params = params.set('periodo', periodo);
        }
        return this.http.get<ApiResponse<EvaluacionResponse[]>>(
            `${this.base}/calificaciones/evaluaciones`,
            { params }
        );
    }

    crearEvaluacion(body: EvaluacionRequest): Observable<ApiResponse<EvaluacionResponse>> {
        return this.http.post<ApiResponse<EvaluacionResponse>>(
            `${this.base}/calificaciones/evaluaciones`,
            body
        );
    }

    actualizarEvaluacion(id: string, body: EvaluacionRequest): Observable<ApiResponse<EvaluacionResponse>> {
        return this.http.put<ApiResponse<EvaluacionResponse>>(
            `${this.base}/calificaciones/evaluaciones/${id}`,
            body
        );
    }

    obtenerPlantilla(idEvaluacion: string): Observable<ApiResponse<CalificacionPlantillaResponse>> {
        const params = new HttpParams().set('idEvaluacion', idEvaluacion);
        return this.http.get<ApiResponse<CalificacionPlantillaResponse>>(
            `${this.base}/calificaciones/plantilla`,
            { params }
        );
    }

    guardarCalificaciones(body: CalificacionRegistroRequest): Observable<ApiResponse<CalificacionPlantillaResponse>> {
        return this.http.post<ApiResponse<CalificacionPlantillaResponse>>(
            `${this.base}/calificaciones`,
            body
        );
    }

    obtenerResumen(idAsignacionDocente: string, periodo: number): Observable<ApiResponse<CalificacionResumenResponse>> {
        const params = new HttpParams()
            .set('idAsignacionDocente', idAsignacionDocente)
            .set('periodo', periodo);
        return this.http.get<ApiResponse<CalificacionResumenResponse>>(
            `${this.base}/calificaciones/resumen`,
            { params }
        );
    }
}
