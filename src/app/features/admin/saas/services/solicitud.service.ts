import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { SolicitudOnboardingRequest, SolicitudOnboardingResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    /** Endpoint público — sin auth (landing page) */
    enviar(request: SolicitudOnboardingRequest): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.post<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/public/solicitudes`,
            request
        );
    }

    /** SUPER_ADMIN — listar todas o filtrar por estado */
    listar(estado?: string): Observable<ApiResponse<SolicitudOnboardingResponse[]>> {
        const url = estado
            ? `${this.base}/saas/solicitudes?estado=${estado}`
            : `${this.base}/saas/solicitudes`;
        return this.http.get<ApiResponse<SolicitudOnboardingResponse[]>>(url);
    }

    obtener(id: string): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.get<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/saas/solicitudes/${id}`
        );
    }

    aprobar(id: string, notasAdmin?: string): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.put<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/saas/solicitudes/${id}/aprobar`,
            { notasAdmin }
        );
    }

    rechazar(id: string, notasAdmin?: string): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.put<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/saas/solicitudes/${id}/rechazar`,
            { notasAdmin }
        );
    }

    confirmarPago(id: string): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.put<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/saas/solicitudes/${id}/pago`,
            {}
        );
    }

    activar(id: string): Observable<ApiResponse<SolicitudOnboardingResponse>> {
        return this.http.post<ApiResponse<SolicitudOnboardingResponse>>(
            `${this.base}/saas/solicitudes/${id}/activar`,
            {}
        );
    }
}
