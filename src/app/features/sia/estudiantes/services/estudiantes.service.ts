import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { EstudianteRequest, EstudianteResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarEstudiantes(): Observable<ApiResponse<EstudianteResponse[]>> {
        return this.http.get<ApiResponse<EstudianteResponse[]>>(`${this.base}/estudiantes`);
    }
    crearEstudiante(body: EstudianteRequest): Observable<ApiResponse<EstudianteResponse>> {
        return this.http.post<ApiResponse<EstudianteResponse>>(`${this.base}/estudiantes`, body);
    }
    actualizarEstudiante(id: string, body: EstudianteRequest): Observable<ApiResponse<EstudianteResponse>> {
        return this.http.put<ApiResponse<EstudianteResponse>>(`${this.base}/estudiantes/${id}`, body);
    }
    eliminarEstudiante(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/estudiantes/${id}`);
    }
}
