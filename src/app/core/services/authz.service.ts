import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface PrivilegioEntry {
  visibilidad: 'VISIBLE' | 'OCULTO';
  edicion: 'EDITABLE' | 'SOLO_LECTURA' | 'OCULTO';
}

/** Mapa cargado desde /api/privilegios-ui/mi-mapa tras el login */
type PrivilegioMapa = Record<string, PrivilegioEntry>;

@Injectable({ providedIn: 'root' })
export class AuthzService {
  private http = inject(HttpClient);
  private base = environment.api.baseUrl;

  private _mapa = signal<PrivilegioMapa>({});

  /** Signal de solo lectura para suscribirse desde componentes */
  readonly mapa = computed(() => this._mapa());

  /**
   * Carga el mapa de privilegios desde el backend.
   * Llamar tras login exitoso (en AuthService.login pipe).
   */
  cargarMapa(): void {
    this.http
      .get<ApiResponse<PrivilegioMapa>>(`${this.base}/privilegios-ui/mi-mapa`)
      .subscribe({
        next: res => {
          if (res?.codigo === 200 && res.data) {
            this._mapa.set(res.data);
          }
        },
        error: () => {
          // No bloquear el login si falla la carga de privilegios
          this._mapa.set({});
        }
      });
  }

  /** Limpia el mapa al hacer logout */
  limpiarMapa(): void {
    this._mapa.set({});
  }

  /**
   * @returns true si el campo es VISIBLE (o no tiene restricción configurada)
   */
  canView(modulo: string, entidad: string, campo: string): boolean {
    const clave = `${modulo}.${entidad}.${campo}`;
    const entry = this._mapa()[clave];
    if (!entry) return true; // sin restricción → visible por defecto
    return entry.visibilidad === 'VISIBLE';
  }

  /**
   * @returns true si el campo es EDITABLE
   */
  canEdit(modulo: string, entidad: string, campo: string): boolean {
    const clave = `${modulo}.${entidad}.${campo}`;
    const entry = this._mapa()[clave];
    if (!entry) return true; // sin restricción → editable por defecto
    return entry.edicion === 'EDITABLE';
  }
}
