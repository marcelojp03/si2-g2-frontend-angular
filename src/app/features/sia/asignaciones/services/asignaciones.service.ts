import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { AsignacionDocenteRequest, AsignacionDocenteResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class AsignacionesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarAsignaciones(): Observable<ApiResponse<AsignacionDocenteResponse[]>> {
        return this.http.get<ApiResponse<AsignacionDocenteResponse[]>>(`${this.base}/asignaciones`);
    }
    crearAsignacion(body: AsignacionDocenteRequest): Observable<ApiResponse<AsignacionDocenteResponse>> {
        return this.http.post<ApiResponse<AsignacionDocenteResponse>>(`${this.base}/asignaciones`, body);
    }
    eliminarAsignacion(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/asignaciones/${id}`);
    }
}
