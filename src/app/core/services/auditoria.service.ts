import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BitacoraAuditoriaResponse } from '../models/sia.models';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listar(filtro?: { modulo?: string; tipoOperacion?: string; exito?: boolean | null }): Observable<ApiResponse<BitacoraAuditoriaResponse[]>> {
        let params = new HttpParams();
        if (filtro?.modulo) params = params.set('modulo', filtro.modulo);
        if (filtro?.tipoOperacion) params = params.set('tipoOperacion', filtro.tipoOperacion);
        if (filtro?.exito !== undefined && filtro?.exito !== null) params = params.set('exito', String(filtro.exito));
        return this.http.get<ApiResponse<BitacoraAuditoriaResponse[]>>(`${this.base}/auditoria`, { params });
    }
}
