import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { CuotaEstudianteResponse, PagoResponse, RegistrarPagoRequest } from '@/features/sia/planes-pago/models/plan-pago.models';

@Injectable({ providedIn: 'root' })
export class CuotaService {
    private http = inject(HttpClient);
    private base = `${environment.api.baseUrl}/cuotas`;

    misCuotas(idGestion: string): Observable<ApiResponse<CuotaEstudianteResponse[]>> {
        return this.http.get<ApiResponse<CuotaEstudianteResponse[]>>(`${this.base}/mis-cuotas?idGestion=${idGestion}`);
    }

    pagar(body: RegistrarPagoRequest): Observable<ApiResponse<PagoResponse>> {
        return this.http.post<ApiResponse<PagoResponse>>(`${this.base}/pagar`, body);
    }

    misPagos(): Observable<ApiResponse<PagoResponse[]>> {
        return this.http.get<ApiResponse<PagoResponse[]>>(`${this.base}/mis-pagos`);
    }
}
