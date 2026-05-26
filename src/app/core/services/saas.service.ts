import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
    ModuloSistemaResponse,
    PlanSuscripcionRequest,
    PlanSuscripcionResponse,
    SuscripcionInstitucionRequest,
    SuscripcionInstitucionResponse,
    IntentoLoginResponse,
} from '../models/sia.models';

@Injectable({ providedIn: 'root' })
export class SaasService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    // ── Módulos del sistema ──────────────────────────────────────────────────
    listarModulos(estado?: string): Observable<ApiResponse<ModuloSistemaResponse[]>> {
        let params = new HttpParams();
        if (estado) params = params.set('estado', estado);
        return this.http.get<ApiResponse<ModuloSistemaResponse[]>>(`${this.base}/saas/modulos`, { params });
    }

    // ── Planes de suscripción ────────────────────────────────────────────────
    listarPlanes(estado?: string): Observable<ApiResponse<PlanSuscripcionResponse[]>> {
        let params = new HttpParams();
        if (estado) params = params.set('estado', estado);
        return this.http.get<ApiResponse<PlanSuscripcionResponse[]>>(`${this.base}/saas/planes`, { params });
    }

    obtenerPlan(id: string): Observable<ApiResponse<PlanSuscripcionResponse>> {
        return this.http.get<ApiResponse<PlanSuscripcionResponse>>(`${this.base}/saas/planes/${id}`);
    }

    crearPlan(request: PlanSuscripcionRequest): Observable<ApiResponse<PlanSuscripcionResponse>> {
        return this.http.post<ApiResponse<PlanSuscripcionResponse>>(`${this.base}/saas/planes`, request);
    }

    actualizarPlan(id: string, request: PlanSuscripcionRequest): Observable<ApiResponse<PlanSuscripcionResponse>> {
        return this.http.put<ApiResponse<PlanSuscripcionResponse>>(`${this.base}/saas/planes/${id}`, request);
    }

    desactivarPlan(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/saas/planes/${id}`);
    }

    // ── Suscripciones ────────────────────────────────────────────────────────
    obtenerSuscripcionActiva(idInstitucion?: string): Observable<ApiResponse<SuscripcionInstitucionResponse>> {
        let params = new HttpParams();
        if (idInstitucion) params = params.set('idInstitucion', idInstitucion);
        return this.http.get<ApiResponse<SuscripcionInstitucionResponse>>(`${this.base}/saas/suscripciones/activa`, { params });
    }

    suscribir(request: SuscripcionInstitucionRequest, idInstitucion?: string): Observable<ApiResponse<SuscripcionInstitucionResponse>> {
        let params = new HttpParams();
        if (idInstitucion) params = params.set('idInstitucion', idInstitucion);
        return this.http.post<ApiResponse<SuscripcionInstitucionResponse>>(`${this.base}/saas/suscripciones`, request, { params });
    }

    cancelarSuscripcion(idInstitucion?: string): Observable<ApiResponse<void>> {
        let params = new HttpParams();
        if (idInstitucion) params = params.set('idInstitucion', idInstitucion);
        return this.http.delete<ApiResponse<void>>(`${this.base}/saas/suscripciones/activa`, { params });
    }

    // ── Intentos de login ────────────────────────────────────────────────────
    listarIntentosLogin(filtro?: {
        idInstitucion?: string;
        correo?: string;
        soloFallos?: boolean;
        fechaDesde?: string;
        fechaHasta?: string;
        limite?: number;
    }): Observable<ApiResponse<IntentoLoginResponse[]>> {
        let params = new HttpParams();
        if (filtro?.idInstitucion) params = params.set('idInstitucion', filtro.idInstitucion);
        if (filtro?.correo) params = params.set('correo', filtro.correo);
        if (filtro?.soloFallos) params = params.set('soloFallos', 'true');
        if (filtro?.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
        if (filtro?.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);
        if (filtro?.limite) params = params.set('limite', String(filtro.limite));
        return this.http.get<ApiResponse<IntentoLoginResponse[]>>(`${this.base}/auth/intentos-login`, { params });
    }
}
