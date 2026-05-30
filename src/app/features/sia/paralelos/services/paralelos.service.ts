import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { ParaleloRequest, ParaleloResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class ParalelosService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarParalelos(idCurso?: string): Observable<ApiResponse<ParaleloResponse[]>> {
        const params = idCurso ? `?idCurso=${idCurso}` : '';
        return this.http.get<ApiResponse<ParaleloResponse[]>>(`${this.base}/paralelos${params}`);
    }
    crearParalelo(body: ParaleloRequest): Observable<ApiResponse<ParaleloResponse>> {
        return this.http.post<ApiResponse<ParaleloResponse>>(`${this.base}/paralelos`, body);
    }
    actualizarParalelo(id: string, body: ParaleloRequest): Observable<ApiResponse<ParaleloResponse>> {
        return this.http.put<ApiResponse<ParaleloResponse>>(`${this.base}/paralelos/${id}`, body);
    }
    eliminarParalelo(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/paralelos/${id}`);
    }
}
