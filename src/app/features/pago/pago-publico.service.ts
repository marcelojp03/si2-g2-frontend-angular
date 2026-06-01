import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PagoPublicoDto {
  tokenPago: string;
  monto: number;
  moneda: string;
  glosa: string;
  estado: string;
  fechaExpiracion: string | null;
  proveedor: string | null;
  qrBase64: string | null;
}

export interface EstadoPagoPublicoResponse {
  idPago: string;
  referenciaExterna: string | null;
  estadoVpay: string;
  pagado: boolean;
  estadoInterno: string;
}

@Injectable({ providedIn: 'root' })
export class PagoPublicoService {
  private http = inject(HttpClient);
  private base = `${environment.api.baseUrl}/public/pago`;

  obtenerPago(token: string): Observable<{ codigo: number; data: PagoPublicoDto }> {
    return this.http.get<{ codigo: number; data: PagoPublicoDto }>(`${this.base}/${token}`);
  }

  consultarEstado(token: string): Observable<{ codigo: number; data: EstadoPagoPublicoResponse }> {
    return this.http.get<{ codigo: number; data: EstadoPagoPublicoResponse }>(`${this.base}/${token}/estado`);
  }
}
