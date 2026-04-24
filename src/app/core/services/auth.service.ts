import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginData, UsuarioSIA } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.api.baseUrl;

    private currentUserSubject = new BehaviorSubject<UsuarioSIA | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    /** Signal reactivo — usado por MenuService.computed para recalcularse automáticamente */
    private readonly _userSignal = signal<UsuarioSIA | null>(this.getUserFromStorage());
    readonly currentUserSignal = this._userSignal.asReadonly();

    private readonly TOKEN_KEY = environment.auth.tokenKey;
    private readonly USER_KEY = environment.auth.userKey;

    login(correo: string, password: string): Observable<ApiResponse<LoginData>> {
        const body: LoginRequest = { correo, contrasena: password };
        return this.http.post<ApiResponse<LoginData>>(`${this.apiUrl}/auth/login`, body).pipe(
            tap((response) => {
                if (response.codigo === 200 && response.data) {
                    localStorage.setItem(this.TOKEN_KEY, response.data.token);
                    const user = this.buildUserFromToken(response.data.token);
                    if (user) {
                        this.saveUser(user);
                        this.currentUserSubject.next(user);
                        this._userSignal.set(user);
                    }
                }
            }),
            catchError((error) => {
                console.error('[AuthService] Error en login:', error);
                return throwError(() => error);
            })
        );
    }

    /** Reconstruye el usuario desde el JWT almacenado (para reload de página). */
    loadUserFromToken(): void {
        const token = this.getAccessToken();
        if (token && !this.isTokenExpired(token) && !this.currentUserSubject.value) {
            const user = this.buildUserFromToken(token);
            if (user) {
                this.saveUser(user);
                this.currentUserSubject.next(user);
                this._userSignal.set(user);
            }
        }
    }

    private _isSessionExpiring = false;

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this._userSignal.set(null);
        this.router.navigate(['/auth/login']);
    }

    /** Limpia la sesión sin navegar. Retorna true solo la primera vez (debounce). */
    clearSession(): boolean {
        if (this._isSessionExpiring) return false;
        this._isSessionExpiring = true;
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this._userSignal.set(null);
        return true;
    }

    resetSessionExpiring(): void {
        this._isSessionExpiring = false;
    }

    getAccessToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getCurrentUser(): UsuarioSIA | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        return !!token && !this.isTokenExpired(token);
    }

    isLogged(): boolean {
        return this.isAuthenticated();
    }

    isSuperAdmin(): boolean {
        return this.getCurrentUser()?.roles?.includes('SUPER_ADMIN') ?? false;
    }

    hasRole(role: string): boolean {
        return this.getCurrentUser()?.roles?.includes(role) ?? false;
    }

    isTokenExpired(token: string): boolean {
        try {
            const payload = this.getTokenPayload(token);
            if (!payload || !payload.exp) return true;
            return Date.now() >= payload.exp * 1000;
        } catch {
            return true;
        }
    }

    private buildUserFromToken(token: string): UsuarioSIA | null {
        const payload = this.getTokenPayload(token);
        if (!payload) return null;
        return {
            correo: payload.sub ?? '',
            idInstitucion: payload.id_institucion ?? null,
            roles: Array.isArray(payload.roles) ? payload.roles : [],
        };
    }

    private getTokenPayload(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    private saveUser(user: UsuarioSIA): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private getUserFromStorage(): UsuarioSIA | null {
        const str = localStorage.getItem(this.USER_KEY);
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }
}
