import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { QbeEntityDefinitionResponse, QbePreviewRequest, ReporteMetadataResponse, ReporteNaturalLanguageRequest, ReportePreviewRequest, ReportePreviewResponse } from '../models/reporte.models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private http = inject(HttpClient);
    private base = `${environment.api.baseUrl}/reportes`;

    catalogo(): Observable<ApiResponse<ReporteMetadataResponse[]>> {
        return this.http.get<ApiResponse<ReporteMetadataResponse[]>>(`${this.base}/catalogo`);
    }

    preview(request: ReportePreviewRequest): Observable<ApiResponse<ReportePreviewResponse>> {
        return this.http.post<ApiResponse<ReportePreviewResponse>>(`${this.base}/preview`, request);
    }

    exportar(formato: string, request: ReportePreviewRequest): Observable<Blob> {
        return this.http.post(`${this.base}/export/${formato.toLowerCase()}`, request, { responseType: 'blob' });
    }

    previewNaturalLanguage(request: ReporteNaturalLanguageRequest): Observable<ApiResponse<ReportePreviewResponse>> {
        return this.http.post<ApiResponse<ReportePreviewResponse>>(`${this.base}/nl/preview`, request);
    }

    exportarNaturalLanguage(formato: string, request: ReporteNaturalLanguageRequest): Observable<Blob> {
        return this.http.post(`${this.base}/nl/export/${formato.toLowerCase()}`, request, { responseType: 'blob' });
    }

    catalogoQbe(): Observable<ApiResponse<QbeEntityDefinitionResponse[]>> {
        return this.http.get<ApiResponse<QbeEntityDefinitionResponse[]>>(`${this.base}/qbe/catalogo`);
    }

    previewQbe(request: QbePreviewRequest): Observable<ApiResponse<ReportePreviewResponse>> {
        return this.http.post<ApiResponse<ReportePreviewResponse>>(`${this.base}/qbe/preview`, request);
    }

    exportarQbe(formato: string, request: QbePreviewRequest): Observable<Blob> {
        return this.http.post(`${this.base}/qbe/export/${formato.toLowerCase()}`, request, { responseType: 'blob' });
    }
}
