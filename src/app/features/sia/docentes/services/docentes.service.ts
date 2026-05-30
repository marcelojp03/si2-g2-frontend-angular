import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { DocenteRequest, DocenteResponse, MateriaResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class DocentesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarDocentes(): Observable<ApiResponse<DocenteResponse[]>> {
        return this.http.get<ApiResponse<DocenteResponse[]>>(`${this.base}/docentes`);
    }
    crearDocente(body: DocenteRequest): Observable<ApiResponse<DocenteResponse>> {
        return this.http.post<ApiResponse<DocenteResponse>>(`${this.base}/docentes`, body);
    }
    actualizarDocente(id: string, body: DocenteRequest): Observable<ApiResponse<DocenteResponse>> {
        return this.http.put<ApiResponse<DocenteResponse>>(`${this.base}/docentes/${id}`, body);
    }
    eliminarDocente(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/docentes/${id}`);
    }
    listarMaterias(): Observable<ApiResponse<MateriaResponse[]>> {
        return this.http.get<ApiResponse<MateriaResponse[]>>(`${this.base}/materias`);
    }
}
