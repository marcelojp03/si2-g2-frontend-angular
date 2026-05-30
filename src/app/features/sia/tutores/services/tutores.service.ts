import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import {
    TutorRequest, TutorResponse,
    TutorEstudianteRequest, TutorEstudianteResponse
} from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class TutoresService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarTutores(): Observable<ApiResponse<TutorResponse[]>> {
        return this.http.get<ApiResponse<TutorResponse[]>>(`${this.base}/tutores`);
    }
    crearTutor(body: TutorRequest): Observable<ApiResponse<TutorResponse>> {
        return this.http.post<ApiResponse<TutorResponse>>(`${this.base}/tutores`, body);
    }
    actualizarTutor(id: string, body: TutorRequest): Observable<ApiResponse<TutorResponse>> {
        return this.http.put<ApiResponse<TutorResponse>>(`${this.base}/tutores/${id}`, body);
    }
    eliminarTutor(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/tutores/${id}`);
    }
    vincularTutorEstudiante(idEstudiante: string, body: TutorEstudianteRequest): Observable<ApiResponse<TutorEstudianteResponse>> {
        return this.http.post<ApiResponse<TutorEstudianteResponse>>(`${this.base}/estudiantes/${idEstudiante}/tutores`, body);
    }
    listarVinculosEstudiante(idEstudiante: string): Observable<ApiResponse<TutorEstudianteResponse[]>> {
        return this.http.get<ApiResponse<TutorEstudianteResponse[]>>(`${this.base}/estudiantes/${idEstudiante}/tutores`);
    }
}
