import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { CursoRequest, CursoResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class CursosService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarCursos(): Observable<ApiResponse<CursoResponse[]>> {
        return this.http.get<ApiResponse<CursoResponse[]>>(`${this.base}/cursos`);
    }
    crearCurso(body: CursoRequest): Observable<ApiResponse<CursoResponse>> {
        return this.http.post<ApiResponse<CursoResponse>>(`${this.base}/cursos`, body);
    }
    actualizarCurso(id: string, body: CursoRequest): Observable<ApiResponse<CursoResponse>> {
        return this.http.put<ApiResponse<CursoResponse>>(`${this.base}/cursos/${id}`, body);
    }
    eliminarCurso(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/cursos/${id}`);
    }
}
