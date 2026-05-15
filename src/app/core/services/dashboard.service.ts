import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
    DashboardAlert,
    DashboardCatalogoFiltrosResponse,
    DashboardGlobalResponse,
    DashboardInstitucionalResponse,
} from '../models/sia.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    getMiDashboard(filters?: Record<string, string>): Observable<ApiResponse<DashboardInstitucionalResponse>> {
        let params = new HttpParams();
        for (const [key, value] of Object.entries(filters ?? {})) {
            if (value) {
                params = params.set(key, value);
            }
        }
        return this.http.get<ApiResponse<DashboardInstitucionalResponse>>(`${this.base}/dashboard/me`, { params });
    }

    getDashboardGlobal(): Observable<ApiResponse<DashboardGlobalResponse>> {
        return this.http.get<ApiResponse<DashboardGlobalResponse>>(`${this.base}/admin/dashboard`);
    }

    getCatalogoFiltros(): Observable<ApiResponse<DashboardCatalogoFiltrosResponse>> {
        return this.http.get<ApiResponse<DashboardCatalogoFiltrosResponse>>(`${this.base}/dashboard/catalogo-filtros`);
    }

    getAlertas(filters?: { severidad?: string; modulo?: string; estado?: string }): Observable<ApiResponse<DashboardAlert[]>> {
        let params = new HttpParams();
        if (filters?.severidad) params = params.set('severidad', filters.severidad);
        if (filters?.modulo) params = params.set('modulo', filters.modulo);
        if (filters?.estado) params = params.set('estado', filters.estado);
        return this.http.get<ApiResponse<DashboardAlert[]>>(`${this.base}/dashboard/alertas`, { params });
    }
}
