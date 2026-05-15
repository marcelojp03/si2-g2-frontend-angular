import { Injectable, inject, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MenuService {
    private auth = inject(AuthService);

    /**
     * Retorna los items del menú lateral según el rol del usuario autenticado.
     * Computed se recalcula automáticamente si cambia currentUser$.
     */
    readonly items = computed<MenuItem[]>(() => {
        const user = this.auth.currentUserSignal();

        if (!user) return [];

        if (user.roles.includes('SUPER_ADMIN')) {
            return this.menuSuperAdmin();
        }

        return this.menuInstitucion(user.roles ?? [], user.permisos ?? []);
    });

    private menuSuperAdmin(): MenuItem[] {
        return [
            {
                label: 'Administración Global',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/admin'] },
                    { label: 'Instituciones', icon: 'pi pi-fw pi-building', routerLink: ['/admin/instituciones'] },
                    { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/admin/usuarios'] },
                    { label: 'Roles y permisos', icon: 'pi pi-fw pi-shield', routerLink: ['/admin/roles'] },
                    { label: 'Auditoría', icon: 'pi pi-fw pi-history', routerLink: ['/admin/auditoria'] },
                ]
            }
        ];
    }

    private menuInstitucion(roles: string[], permisos: string[]): MenuItem[] {
        const has = (permiso: string) => permisos.includes(permiso);
        const hasRole = (role: string) => roles.includes(role);

        const canUsuarios = has('USUARIOS_READ') || has('USUARIOS_WRITE');
        const canConfiguracion = has('CONFIGURACION_READ') || has('CONFIGURACION_WRITE');
        const canRoles = has('ROLES_READ') || has('ROLES_WRITE');
        const canAuditoria = has('AUDITORIA_READ') || hasRole('ADMIN_INSTITUCION') || hasRole('DIRECTOR');
        const canGestionAcademica = has('GESTION_READ') || has('GESTION_WRITE');
        const canPersonas = has('PERSONAS_READ') || has('PERSONAS_WRITE');
        const canOperacion = has('OPERACION_READ') || has('OPERACION_WRITE');
        const canMiArea = has('MI_AREA_READ');

        const menu: MenuItem[] = [
            {
                label: 'Principal',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                ]
            }
        ];

        if (canUsuarios || canConfiguracion || canRoles || canAuditoria) {
            menu.push({ separator: true });
            const items: MenuItem[] = [];
            if (canUsuarios) items.push({ label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/usuarios'] });
            if (canRoles) items.push({ label: 'Roles y permisos', icon: 'pi pi-fw pi-shield', routerLink: ['/roles'] });
            if (canConfiguracion) items.push({ label: 'Configuración Institución', icon: 'pi pi-fw pi-cog', routerLink: ['/configuracion'] });
            if (canAuditoria) items.push({ label: 'Auditoría', icon: 'pi pi-fw pi-history', routerLink: ['/auditoria'] });
            menu.push({
                label: 'Configuración',
                items
            });
        }

        if (canGestionAcademica) {
            menu.push({ separator: true });
            menu.push({
                label: 'Gestión Académica',
                items: [
                    { label: 'Gestiones', icon: 'pi pi-fw pi-calendar', routerLink: ['/gestiones'] },
                    { label: 'Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/cursos'] },
                    { label: 'Paralelos', icon: 'pi pi-fw pi-table', routerLink: ['/paralelos'] },
                    { label: 'Aulas', icon: 'pi pi-fw pi-building', routerLink: ['/aulas'] },
                    { label: 'Materias', icon: 'pi pi-fw pi-list', routerLink: ['/materias'] },
                    { label: 'Asig. Materias a Cursos', icon: 'pi pi-fw pi-link', routerLink: ['/materias-curso'] },
                ]
            });
        }

        if (canPersonas) {
            menu.push({ separator: true });
            menu.push({
                label: 'Personas',
                items: [
                    { label: 'Docentes', icon: 'pi pi-fw pi-id-card', routerLink: ['/docentes'] },
                    { label: 'Estudiantes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/estudiantes'] },
                    { label: 'Tutores', icon: 'pi pi-fw pi-users', routerLink: ['/tutores'] },
                ]
            });
        }

        if (canOperacion) {
            menu.push({ separator: true });
            menu.push({
                label: 'Operación Académica',
                items: [
                    { label: 'Inscripciones', icon: 'pi pi-fw pi-file-edit', routerLink: ['/inscripciones'] },
                    { label: 'Asignaciones Docentes', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/asignaciones'] },
                ]
            });
        }

        if (canMiArea) {
            menu.push({ separator: true });
            menu.push({
                label: 'Mi área',
                items: [
                    { label: 'Mis asignaciones', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/asignaciones'] },
                ]
            });
        }

        return menu;
    }
}
