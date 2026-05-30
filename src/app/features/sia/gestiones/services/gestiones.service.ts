import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { GestionAcademicaRequest, GestionAcademicaResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class GestionesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarGestiones(): Observable<ApiResponse<GestionAcademicaResponse[]>> {
        return this.http.get<ApiResponse<GestionAcademicaResponse[]>>(`${this.base}/gestiones`);
    }
    crearGestion(body: GestionAcademicaRequest): Observable<ApiResponse<GestionAcademicaResponse>> {
        return this.http.post<ApiResponse<GestionAcademicaResponse>>(`${this.base}/gestiones`, body);
    }
    actualizarGestion(id: string, body: GestionAcademicaRequest): Observable<ApiResponse<GestionAcademicaResponse>> {
        return this.http.put<ApiResponse<GestionAcademicaResponse>>(`${this.base}/gestiones/${id}`, body);
    }
    eliminarGestion(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/gestiones/${id}`);
    }
}
