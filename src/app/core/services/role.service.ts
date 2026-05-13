import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PermisoResponse, RolRequest, RolResponse } from '../models/sia.models';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    listarRoles(): Observable<ApiResponse<RolResponse[]>> {
        return this.http.get<ApiResponse<RolResponse[]>>(`${this.base}/roles`);
    }

    listarRolesAsignables(): Observable<ApiResponse<RolResponse[]>> {
        return this.http.get<ApiResponse<RolResponse[]>>(`${this.base}/roles/asignables`);
    }

    listarPermisos(): Observable<ApiResponse<PermisoResponse[]>> {
        return this.http.get<ApiResponse<PermisoResponse[]>>(`${this.base}/roles/permisos`);
    }

    crearRol(body: RolRequest): Observable<ApiResponse<RolResponse>> {
        return this.http.post<ApiResponse<RolResponse>>(`${this.base}/roles`, body);
    }

    actualizarRol(id: string, body: RolRequest): Observable<ApiResponse<RolResponse>> {
        return this.http.put<ApiResponse<RolResponse>>(`${this.base}/roles/${id}`, body);
    }

    eliminarRol(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.base}/roles/${id}`);
    }
}
