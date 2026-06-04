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
                ],
            },
            { separator: true },
            {
                label: 'SaaS',
                items: [
                    { label: 'Planes de Suscripción', icon: 'pi pi-fw pi-box', routerLink: ['/admin/saas/planes'] },
                    { label: 'Suscripciones', icon: 'pi pi-fw pi-credit-card', routerLink: ['/admin/saas/suscripciones'] },
                    { label: 'Solicitudes', icon: 'pi pi-fw pi-inbox', routerLink: ['/admin/saas/solicitudes'] },
                ],
            },
            { separator: true },
            {
                label: 'Herramientas',
                items: [
                    { label: 'Respaldos', icon: 'pi pi-fw pi-database', routerLink: ['/backups'] },
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'] },
                ],
            },
        ];
    }

    private menuInstitucion(roles: string[], permisos: string[]): MenuItem[] {
        const has = (permiso: string) => permisos.includes(permiso);
        const hasRole = (role: string) => roles.includes(role);

        const isDocente = hasRole('DOCENTE');
        const isEstudiante = hasRole('ESTUDIANTE');
        const isAdminInstitucion = hasRole('ADMIN_INSTITUCION');
        const isDirector = hasRole('DIRECTOR');

        const canUsuarios = has('USUARIOS_READ');
        const canConfiguracion = has('CONFIGURACION_READ');
        const canRoles = has('ROLES_READ');
        const canAuditoria = has('AUDITORIA_READ') || isAdminInstitucion || isDirector;

        const canGestiones = has('GESTIONES_READ');
        const canCursos = has('CURSOS_READ');
        const canParalelos = has('PARALELOS_READ');
        const canAulas = has('AULAS_READ');
        const canMaterias = has('MATERIAS_READ');
        const canGestionAcademica = canGestiones || canCursos || canParalelos || canAulas || canMaterias;

        const canDocentes = has('DOCENTES_READ');
        const canEstudiantes = has('ESTUDIANTES_READ');
        const canTutores = has('TUTORES_READ');
        const canPersonas = canDocentes || canEstudiantes || canTutores;

        const canInscripciones = has('INSCRIPCIONES_READ');
        const canAsignaciones = has('ASIGNACIONES_READ');
        const canHorarios = has('HORARIOS_READ');
        const canOperacion = canInscripciones || canAsignaciones || canHorarios;
        const canOperacionAdministrativa = canOperacion && !isDocente;

        const canMiArea = has('MI_AREA_READ') || isDocente || isEstudiante;

        const canBackups = isAdminInstitucion;
        const canReportes = has('REPORTES_READ') || has('REPORTES_EXPORT') || has('REPORTES_WRITE') || isAdminInstitucion || isDirector || hasRole('SECRETARIO');
        const canAlertas = isAdminInstitucion || isDirector || hasRole('SECRETARIO');

        const canAsistencia =
            has('ASISTENCIA_READ') ||
            has('ASISTENCIA_READ_ALL') ||
            isDocente ||
            isAdminInstitucion ||
            isDirector;

        const canCalificaciones =
            has('CALIFICACIONES_READ') ||
            has('CALIFICACIONES_READ_ALL') ||
            isDocente ||
            isAdminInstitucion ||
            isDirector;

        const menu: MenuItem[] = [
            {
                label: 'Principal',
                items: [
                    { label: 'Inicio', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
                ],
            },
        ];

        if (canUsuarios || canConfiguracion || canRoles || canAuditoria) {
            menu.push({ separator: true });

            const items: MenuItem[] = [];

            if (canUsuarios) {
                items.push({ label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/usuarios'] });
            }

            if (canRoles) {
                items.push({ label: 'Roles y permisos', icon: 'pi pi-fw pi-shield', routerLink: ['/roles'] });
            }

            if (canConfiguracion) {
                items.push({ label: 'Configuración Institución', icon: 'pi pi-fw pi-cog', routerLink: ['/configuracion'] });
            }

            if (canAuditoria) {
                items.push({ label: 'Auditoría', icon: 'pi pi-fw pi-history', routerLink: ['/auditoria'] });
            }

            if (isAdminInstitucion || isDirector) {
                items.push({ label: 'Mi Plan', icon: 'pi pi-fw pi-credit-card', routerLink: ['/suscripcion'] });
                items.push({ label: 'Seguridad', icon: 'pi pi-fw pi-lock', routerLink: ['/seguridad'] });
            }

            menu.push({
                label: 'Configuración',
                items,
            });
        }

        if (canGestionAcademica) {
            menu.push({ separator: true });

            const gestionItems: MenuItem[] = [];

            if (canGestiones) {
                gestionItems.push({ label: 'Gestiones', icon: 'pi pi-fw pi-calendar', routerLink: ['/gestiones'] });
            }
            if (canCursos) {
                gestionItems.push({ label: 'Cursos', icon: 'pi pi-fw pi-book', routerLink: ['/cursos'] });
            }
            if (canParalelos) {
                gestionItems.push({ label: 'Paralelos', icon: 'pi pi-fw pi-table', routerLink: ['/paralelos'] });
            }
            if (canAulas) {
                gestionItems.push({ label: 'Aulas', icon: 'pi pi-fw pi-building', routerLink: ['/aulas'] });
            }
            if (canMaterias) {
                gestionItems.push({ label: 'Materias', icon: 'pi pi-fw pi-list', routerLink: ['/materias'] });
                gestionItems.push({ label: 'Asig. Materias a Cursos', icon: 'pi pi-fw pi-link', routerLink: ['/materias-curso'] });
            }

            menu.push({
                label: 'Gestión Académica',
                items: gestionItems,
            });
        }

        if (canPersonas) {
            menu.push({ separator: true });

            const personasItems: MenuItem[] = [];

            if (canDocentes) {
                personasItems.push({ label: 'Docentes', icon: 'pi pi-fw pi-id-card', routerLink: ['/docentes'] });
            }
            if (canEstudiantes) {
                personasItems.push({ label: 'Estudiantes', icon: 'pi pi-fw pi-user-plus', routerLink: ['/estudiantes'] });
            }
            if (canTutores) {
                personasItems.push({ label: 'Tutores', icon: 'pi pi-fw pi-users', routerLink: ['/tutores'] });
            }

            menu.push({
                label: 'Personas',
                items: personasItems,
            });
        }

        if (canOperacionAdministrativa || (canAsistencia && !isDocente) || (canCalificaciones && !isDocente)) {
            menu.push({ separator: true });

            const operacionItems: MenuItem[] = [];

            if (canInscripciones) {
                operacionItems.push({ label: 'Inscripciones', icon: 'pi pi-fw pi-file-edit', routerLink: ['/inscripciones'] });
            }
            if (canAsignaciones) {
                operacionItems.push({ label: 'Asignaciones Docentes', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/asignaciones'] });
            }
            if (canHorarios) {
                operacionItems.push({ label: 'Horarios', icon: 'pi pi-fw pi-calendar', routerLink: ['/horarios'] });
            }

            if (canAsistencia && !isDocente) {
                operacionItems.push(
                    { label: 'Asistencia', icon: 'pi pi-fw pi-check-square', routerLink: ['/asistencia'] },
                );
            }

            if (canCalificaciones && !isDocente) {
                operacionItems.push(
                    { label: 'Calificaciones', icon: 'pi pi-fw pi-file-edit', routerLink: ['/calificaciones'] },
                );
            }

            if (canEstudiantes) {
                operacionItems.push(
                    { label: 'Historial Académico', icon: 'pi pi-fw pi-book', routerLink: ['/historial'] },
                );
            }

            if (operacionItems.length > 0) {
                menu.push({
                    label: 'Operación Académica',
                    items: operacionItems,
                });
            }
        }

        if (canReportes) {
            menu.push({ separator: true });
            menu.push({
                label: 'Análisis',
                items: [
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'] },
                ],
            });
        }

        if (canMiArea) {
            menu.push({ separator: true });

            const miAreaItems: MenuItem[] = [];

            if (!isEstudiante) {
                miAreaItems.push(
                    { label: 'Mis asignaciones', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/asignaciones'] },
                );
            }

            if (canAsistencia) {
                miAreaItems.push(
                    { label: 'Registrar asistencia', icon: 'pi pi-fw pi-check-square', routerLink: ['/asistencia'] },
                );
            }

            if (canCalificaciones || isEstudiante) {
                miAreaItems.push(
                    { label: 'Calificaciones', icon: 'pi pi-fw pi-file-edit', routerLink: ['/calificaciones'] },
                );
            }

            miAreaItems.push(
                { label: 'Historial Académico', icon: 'pi pi-fw pi-book', routerLink: ['/historial'] },
            );

            menu.push({
                label: 'Mi área',
                items: miAreaItems,
            });
        }

        if (canBackups || canReportes || canAlertas) {
            menu.push({ separator: true });

            const herramientasItems: MenuItem[] = [];

            if (canReportes) {
                herramientasItems.push({ label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'] });
            }

            if (canAlertas) {
                herramientasItems.push({ label: 'Alertas de Riesgo', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/alertas'] });
            }

            if (canBackups) {
                herramientasItems.push({ label: 'Respaldos', icon: 'pi pi-fw pi-database', routerLink: ['/backups'] });
            }

            menu.push({ label: 'Herramientas', items: herramientasItems });
        }

        return menu;
    }
}
