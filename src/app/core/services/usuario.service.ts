import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
    UsuarioResponse,
    CrearUsuarioRequest,
    ActualizarUsuarioRequest,
    AsignarRolRequest,
} from '../models/sia.models';

export interface PaginatedUsuarios {
    usuarios: UsuarioResponse[];
    total: number;
    pagina: number;
    totalPaginas: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listar(): Observable<ApiResponse<UsuarioResponse[]>> {
        return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.base}/usuarios`);
    }

    listarPaginado(params: {
        search?: string; page: number; size: number; sortField?: string; sortDir?: string;
    }): Observable<ApiResponse<PaginatedUsuarios>> {
        let httpParams = new HttpParams()
            .set('page', params.page)
            .set('size', params.size);
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.sortField) httpParams = httpParams.set('sortField', params.sortField);
        if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
        return this.http.get<ApiResponse<PaginatedUsuarios>>(`${this.base}/usuarios/paginado`, { params: httpParams });
    }

    obtener(id: string): Observable<ApiResponse<UsuarioResponse>> {
        return this.http.get<ApiResponse<UsuarioResponse>>(`${this.base}/usuarios/${id}`);
    }

    crear(body: CrearUsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
        return this.http.post<ApiResponse<UsuarioResponse>>(`${this.base}/auth/register`, body);
    }

    actualizar(id: string, body: ActualizarUsuarioRequest): Observable<ApiResponse<UsuarioResponse>> {
        return this.http.put<ApiResponse<UsuarioResponse>>(`${this.base}/usuarios/${id}`, body);
    }

    eliminar(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/usuarios/${id}`);
    }

    asignarRol(id: string, body: AsignarRolRequest): Observable<ApiResponse<UsuarioResponse>> {
        return this.http.post<ApiResponse<UsuarioResponse>>(`${this.base}/usuarios/${id}/roles`, body);
    }
}
