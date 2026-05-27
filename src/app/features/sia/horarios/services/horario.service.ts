import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { HorarioClaseRequest, HorarioClaseResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class HorarioService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarPorInstitucion(idInstitucion: string): Observable<ApiResponse<HorarioClaseResponse[]>> {
        return this.http.get<ApiResponse<HorarioClaseResponse[]>>(
            `${this.base}/horarios?idInstitucion=${idInstitucion}`
        );
    }

    obtenerPorId(id: string): Observable<ApiResponse<HorarioClaseResponse>> {
        return this.http.get<ApiResponse<HorarioClaseResponse>>(`${this.base}/horarios/${id}`);
    }

    crear(body: HorarioClaseRequest): Observable<ApiResponse<HorarioClaseResponse>> {
        return this.http.post<ApiResponse<HorarioClaseResponse>>(`${this.base}/horarios`, body);
    }

    actualizar(id: string, body: HorarioClaseRequest): Observable<ApiResponse<HorarioClaseResponse>> {
        return this.http.put<ApiResponse<HorarioClaseResponse>>(`${this.base}/horarios/${id}`, body);
    }

    eliminar(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/horarios/${id}`);
    }

    listarPorAsignacion(idAsignacionDocente: string): Observable<ApiResponse<HorarioClaseResponse[]>> {
        return this.http.get<ApiResponse<HorarioClaseResponse[]>>(
            `${this.base}/horarios/asignacion/${idAsignacionDocente}`
        );
    }

    listarPorAula(idAula: string): Observable<ApiResponse<HorarioClaseResponse[]>> {
        return this.http.get<ApiResponse<HorarioClaseResponse[]>>(
            `${this.base}/horarios/aula/${idAula}`
        );
    }
}
