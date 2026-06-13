import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { PlanPagoRequest, PlanPagoResponse } from '@/features/sia/planes-pago/models/plan-pago.models';

@Injectable({ providedIn: 'root' })
export class PlanPagoService {
    private http = inject(HttpClient);
    private base = `${environment.api.baseUrl}/planes-pago`;

    listar(soloActivos = true): Observable<ApiResponse<PlanPagoResponse[]>> {
        return this.http.get<ApiResponse<PlanPagoResponse[]>>(`${this.base}?soloActivos=${soloActivos}`);
    }

    obtener(id: string): Observable<ApiResponse<PlanPagoResponse>> {
        return this.http.get<ApiResponse<PlanPagoResponse>>(`${this.base}/${id}`);
    }

    crear(body: PlanPagoRequest): Observable<ApiResponse<PlanPagoResponse>> {
        return this.http.post<ApiResponse<PlanPagoResponse>>(`${this.base}`, body);
    }

    actualizar(id: string, body: PlanPagoRequest): Observable<ApiResponse<PlanPagoResponse>> {
        return this.http.put<ApiResponse<PlanPagoResponse>>(`${this.base}/${id}`, body);
    }

    desactivar(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`);
    }
}
