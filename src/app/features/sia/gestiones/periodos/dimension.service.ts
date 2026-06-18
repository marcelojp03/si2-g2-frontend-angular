import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { DimensionResponse, DimensionRequest, PeriodoDimensionRequest, PeriodoDimensionResponse } from './dimension.models';

@Injectable({ providedIn: 'root' })
export class DimensionService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarDimensiones(): Observable<ApiResponse<DimensionResponse[]>> {
        return this.http.get<ApiResponse<DimensionResponse[]>>(this.base + '/dimensiones');
    }

    listarModeloInstitucional(): Observable<ApiResponse<DimensionResponse[]>> {
        return this.http.get<ApiResponse<DimensionResponse[]>>(this.base + '/dimensiones/modelo-institucional');
    }

    actualizarModeloInstitucional(body: DimensionRequest[]): Observable<ApiResponse<DimensionResponse[]>> {
        return this.http.put<ApiResponse<DimensionResponse[]>>(this.base + '/dimensiones/modelo-institucional', body);
    }

    crearInstitucional(body: DimensionRequest): Observable<ApiResponse<DimensionResponse>> {
        return this.http.post<ApiResponse<DimensionResponse>>(this.base + '/dimensiones/institucion', body);
    }

    actualizarDimension(id: string, body: DimensionRequest): Observable<ApiResponse<DimensionResponse>> {
        return this.http.put<ApiResponse<DimensionResponse>>(this.base + '/dimensiones/' + id, body);
    }

    eliminarDimension(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(this.base + '/dimensiones/' + id);
    }

    pesosPeriodo(idPeriodo: string): Observable<ApiResponse<PeriodoDimensionResponse[]>> {
        return this.http.get<ApiResponse<PeriodoDimensionResponse[]>>(this.base + '/dimensiones/periodos/' + idPeriodo);
    }

    actualizarPesosPeriodo(idPeriodo: string, body: PeriodoDimensionRequest[]): Observable<ApiResponse<PeriodoDimensionResponse[]>> {
        return this.http.put<ApiResponse<PeriodoDimensionResponse[]>>(this.base + '/dimensiones/periodos/' + idPeriodo, body);
    }
}
