import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import {
    QbeEntityDefinitionResponse,
    QbePreviewRequest,
    ReporteMetadataResponse,
    ReporteNaturalLanguageRequest,
    ReportePreviewRequest,
    ReportePreviewResponse,
} from '@/core/models/reporte.models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
    private http = inject(HttpClient);
    private base = `${environment.api.baseUrl}/reportes`;

    reporteAsistencia(idGestion: string, idParalelo?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        let params = new HttpParams().set('idGestion', idGestion);
        if (idParalelo) params = params.set('idParalelo', idParalelo);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/asistencia`, { params });
    }

    reporteCalificaciones(idGestion: string, idParalelo?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        let params = new HttpParams().set('idGestion', idGestion);
        if (idParalelo) params = params.set('idParalelo', idParalelo);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/calificaciones`, { params });
    }

    reporteInscripciones(idGestion: string, idCurso?: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        let params = new HttpParams().set('idGestion', idGestion);
        if (idCurso) params = params.set('idCurso', idCurso);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/inscripciones`, { params });
    }

    reporteGerencial(idGestion: string): Observable<ApiResponse<Record<string, unknown>>> {
        const params = new HttpParams().set('idGestion', idGestion);
        return this.http.get<ApiResponse<Record<string, unknown>>>(`${this.base}/gerencial`, { params });
    }

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

    rendimientoEstudiante(idEstudiante: string, idGestion: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        const params = new HttpParams().set('idEstudiante', idEstudiante).set('idGestion', idGestion);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/rendimiento-estudiante`, { params });
    }

    exportarRendimientoEstudiante(formato: string, idEstudiante: string, idGestion: string): Observable<Blob> {
        const params = new HttpParams().set('idEstudiante', idEstudiante).set('idGestion', idGestion);
        return this.http.get(`${this.base}/rendimiento-estudiante/export/${formato.toLowerCase()}`, { params, responseType: 'blob' });
    }

    rankingParalelo(idParalelo: string, idGestion: string): Observable<ApiResponse<Record<string, unknown>[]>> {
        const params = new HttpParams().set('idParalelo', idParalelo).set('idGestion', idGestion);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/ranking-paralelo`, { params });
    }

    riesgoAcademico(idGestion: string, umbralAsistencia?: number, umbralPromedio?: number): Observable<ApiResponse<Record<string, unknown>[]>> {
        let params = new HttpParams().set('idGestion', idGestion);
        if (umbralAsistencia != null) params = params.set('umbralAsistencia', umbralAsistencia);
        if (umbralPromedio != null) params = params.set('umbralPromedio', umbralPromedio);
        return this.http.get<ApiResponse<Record<string, unknown>[]>>(`${this.base}/riesgo-academico`, { params });
    }
}
