import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { MateriaRequest, MateriaResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class MateriasService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarMaterias(): Observable<ApiResponse<MateriaResponse[]>> {
        return this.http.get<ApiResponse<MateriaResponse[]>>(`${this.base}/materias`);
    }
    crearMateria(body: MateriaRequest): Observable<ApiResponse<MateriaResponse>> {
        return this.http.post<ApiResponse<MateriaResponse>>(`${this.base}/materias`, body);
    }
    actualizarMateria(id: string, body: MateriaRequest): Observable<ApiResponse<MateriaResponse>> {
        return this.http.put<ApiResponse<MateriaResponse>>(`${this.base}/materias/${id}`, body);
    }
    eliminarMateria(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/materias/${id}`);
    }
}
