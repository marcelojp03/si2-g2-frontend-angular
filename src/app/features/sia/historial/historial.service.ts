import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { HistorialAcademicoResponse } from '../../../core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class HistorialService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    obtenerHistorial(idEstudiante: string, idGestion?: string): Observable<ApiResponse<HistorialAcademicoResponse>> {
        let params = new HttpParams();
        if (idGestion) {
            params = params.set('idGestion', idGestion);
        }
        return this.http.get<ApiResponse<HistorialAcademicoResponse>>(
            `${this.base}/estudiantes/${idEstudiante}/historial`,
            { params }
        );
    }
}
