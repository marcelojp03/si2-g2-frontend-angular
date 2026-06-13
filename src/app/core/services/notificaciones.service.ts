import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';

export interface Notificacion {
    id: string;
    idInstitucion: string;
    idUsuario: string;
    titulo: string;
    mensaje: string;
    tipo: string;
    referenciaTipo?: string;
    referenciaId?: string;
    leida: boolean;
    leidaEn?: string;
    creadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    private notifUrl = `${this.base}/notificaciones`;

    misNotificaciones(soloNoLeidas = false, page = 0, size = 50): Observable<ApiResponse<Notificacion[]>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (soloNoLeidas) params = params.set('soloNoLeidas', 'true');
        return this.http.get<ApiResponse<Notificacion[]>>(`${this.notifUrl}/mis-notificaciones`, { params });
    }

    contarNoLeidas(): Observable<number> {
        return this.http.get<ApiResponse<{ total: number }>>(`${this.notifUrl}/contar-no-leidas`)
            .pipe(map(r => r.data?.total ?? 0));
    }

    marcarLeida(id: string): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.notifUrl}/${id}/leer`, {});
    }

    marcarTodasLeidas(): Observable<ApiResponse<void>> {
        return this.http.put<ApiResponse<void>>(`${this.notifUrl}/leer-todas`, {});
    }
}
