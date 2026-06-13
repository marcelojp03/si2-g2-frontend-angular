import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { ComunicadoRequest, ComunicadoResponse } from '@/features/sia/comunicados/models/comunicado.models';

@Injectable({ providedIn: 'root' })
export class ComunicadosService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listar(estado?: string, tipo?: string, page = 0, size = 50): Observable<ApiResponse<ComunicadoResponse[]>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (estado) params = params.set('estado', estado);
        if (tipo) params = params.set('tipo', tipo);
        return this.http.get<ApiResponse<ComunicadoResponse[]>>(`${this.base}/comunicados`, { params });
    }

    listarPublicados(tipo?: string, page = 0, size = 50): Observable<ApiResponse<ComunicadoResponse[]>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (tipo) params = params.set('tipo', tipo);
        return this.http.get<ApiResponse<ComunicadoResponse[]>>(`${this.base}/comunicados/publicados`, { params });
    }

    obtener(id: string): Observable<ApiResponse<ComunicadoResponse>> {
        return this.http.get<ApiResponse<ComunicadoResponse>>(`${this.base}/comunicados/${id}`);
    }

    crear(body: ComunicadoRequest): Observable<ApiResponse<ComunicadoResponse>> {
        return this.http.post<ApiResponse<ComunicadoResponse>>(`${this.base}/comunicados`, body);
    }

    actualizar(id: string, body: ComunicadoRequest): Observable<ApiResponse<ComunicadoResponse>> {
        return this.http.put<ApiResponse<ComunicadoResponse>>(`${this.base}/comunicados/${id}`, body);
    }

    publicar(id: string): Observable<ApiResponse<ComunicadoResponse>> {
        return this.http.post<ApiResponse<ComunicadoResponse>>(`${this.base}/comunicados/${id}/publicar`, {});
    }

    archivar(id: string): Observable<ApiResponse<ComunicadoResponse>> {
        return this.http.post<ApiResponse<ComunicadoResponse>>(`${this.base}/comunicados/${id}/archivar`, {});
    }
}
