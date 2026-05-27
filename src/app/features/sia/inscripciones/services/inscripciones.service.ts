import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { InscripcionRequest, InscripcionResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class InscripcionesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarInscripciones(): Observable<ApiResponse<InscripcionResponse[]>> {
        return this.http.get<ApiResponse<InscripcionResponse[]>>(`${this.base}/inscripciones`);
    }
    crearInscripcion(body: InscripcionRequest): Observable<ApiResponse<InscripcionResponse>> {
        return this.http.post<ApiResponse<InscripcionResponse>>(`${this.base}/inscripciones`, body);
    }
    eliminarInscripcion(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/inscripciones/${id}`);
    }
}
