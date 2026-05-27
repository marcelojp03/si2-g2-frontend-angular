import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { AulaRequest, AulaResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class AulasService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarAulas(filtros?: {
        estado?: string;
        capacidadMin?: number | null;
        capacidadMax?: number | null;
        recurso?: string;
        q?: string;
    }): Observable<ApiResponse<AulaResponse[]>> {
        let params = new HttpParams();
        if (filtros?.estado) params = params.set('estado', filtros.estado);
        if (filtros?.capacidadMin != null) params = params.set('capacidadMin', filtros.capacidadMin);
        if (filtros?.capacidadMax != null) params = params.set('capacidadMax', filtros.capacidadMax);
        if (filtros?.recurso) params = params.set('recurso', filtros.recurso);
        if (filtros?.q) params = params.set('q', filtros.q);
        return this.http.get<ApiResponse<AulaResponse[]>>(`${this.base}/aulas`, { params });
    }
    crearAula(body: AulaRequest): Observable<ApiResponse<AulaResponse>> {
        return this.http.post<ApiResponse<AulaResponse>>(`${this.base}/aulas`, body);
    }
    actualizarAula(id: string, body: AulaRequest): Observable<ApiResponse<AulaResponse>> {
        return this.http.put<ApiResponse<AulaResponse>>(`${this.base}/aulas/${id}`, body);
    }
    eliminarAula(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/aulas/${id}`);
    }
}
