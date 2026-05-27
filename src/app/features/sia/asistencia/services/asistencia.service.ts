import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import {
    AsistenciaAsignacionResponse,
    AsistenciaPlantillaResponse,
    AsistenciaRegistroRequest,
    AsistenciaRegistroResponse,
} from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarMisAsignaciones(): Observable<ApiResponse<AsistenciaAsignacionResponse[]>> {
        return this.http.get<ApiResponse<AsistenciaAsignacionResponse[]>>(
            `${this.base}/asistencias/mis-asignaciones`
        );
    }

    obtenerPlantilla(idAsignacionDocente: string, fecha: string): Observable<ApiResponse<AsistenciaPlantillaResponse>> {
        const params = new HttpParams()
            .set('idAsignacionDocente', idAsignacionDocente)
            .set('fecha', fecha);

        return this.http.get<ApiResponse<AsistenciaPlantillaResponse>>(
            `${this.base}/asistencias/plantilla`,
            { params }
        );
    }

    guardarAsistencia(body: AsistenciaRegistroRequest): Observable<ApiResponse<AsistenciaRegistroResponse>> {
        return this.http.post<ApiResponse<AsistenciaRegistroResponse>>(
            `${this.base}/asistencias`,
            body
        );
    }

    obtenerAsistencia(id: string): Observable<ApiResponse<AsistenciaRegistroResponse>> {
        return this.http.get<ApiResponse<AsistenciaRegistroResponse>>(
            `${this.base}/asistencias/${id}`
        );
    }

    obtenerResumen(idAsignacionDocente: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        const params = new HttpParams().set('idAsignacionDocente', idAsignacionDocente);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(
            `${this.base}/asistencias/resumen`,
            { params }
        );
    }
}
