import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import { CursoMateriaRequest, CursoMateriaResponse } from '@/core/models/sia.models';

@Injectable({ providedIn: 'root' })
export class MateriasCursoService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarMateriasCurso(idCurso: string): Observable<ApiResponse<CursoMateriaResponse[]>> {
        return this.http.get<ApiResponse<CursoMateriaResponse[]>>(`${this.base}/cursos/${idCurso}/materias`);
    }
    asignarMateriaCurso(idCurso: string, body: CursoMateriaRequest): Observable<ApiResponse<CursoMateriaResponse>> {
        return this.http.post<ApiResponse<CursoMateriaResponse>>(`${this.base}/cursos/${idCurso}/materias`, body);
    }
    desasignarMateriaCurso(idCurso: string, idMateria: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/cursos/${idCurso}/materias/${idMateria}`);
    }
}
