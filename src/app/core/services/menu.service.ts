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

        return this.menuInstitucion(user.roles ?? [], user.permisos ?? [], user.modulosActivos ?? []);
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

    private menuInstitucion(roles: string[], permisos: string[], modulosActivos: string[]): MenuItem[] {
        const has = (permiso: string) => permisos.includes(permiso);
        const hasRole = (role: string) => roles.includes(role);
        const hasModulo = (modulo: string) => modulosActivos.includes(modulo);
        const hasAnyModulo = (...modulos: string[]) => modulos.some((m) => hasModulo(m));

        const isDocente = hasRole('DOCENTE');
        const isEstudiante = hasRole('ESTUDIANTE');
        const isAdminInstitucion = hasRole('ADMIN_INSTITUCION');
        const isDirector = hasRole('DIRECTOR');

        // Mapeo compatible: módulos reales en BD + módulos canónicos futuros
        const hasIdentidad = hasAnyModulo('IDENTIDAD', 'ACADEMICO_BASE');
        const hasEstructura = hasAnyModulo('ESTRUCTURA', 'ACADEMICO_BASE');
        const hasOperacion = hasAnyModulo('OPERACION', 'ACADEMICO_BASE');

        const hasAulas = hasAnyModulo('AULAS', 'ESTRUCTURA', 'OPERACION');
        const hasHorarios = hasAnyModulo('HORARIOS');
        const hasAsistencia = hasAnyModulo('ASISTENCIA');
        const hasCalificaciones = hasAnyModulo('CALIFICACIONES', 'CALIFICACION');
        const hasReportes = hasAnyModulo('REPORTES');
        const hasSaasGestion = hasAnyModulo('SAAS_GESTION');
        const hasSeguridad = hasAnyModulo('SEGURIDAD', 'AUDITORIA');
        const hasRespaldo = hasAnyModulo('RESPALDO', 'RESPALDOS');

        // Identidad y usuarios
        const canUsuarios = has('USUARIOS_READ') && hasIdentidad;
        const canConfiguracion = has('CONFIGURACION_READ') && hasIdentidad;
        const canRoles = has('ROLES_READ') && hasIdentidad;
        const canAuditoria = (has('AUDITORIA_READ') || isAdminInstitucion || isDirector) && hasSeguridad;

        // Estructura académica
        const canGestiones = has('GESTIONES_READ') && hasEstructura;
        const canCursos = has('CURSOS_READ') && hasEstructura;
        const canParalelos = has('PARALELOS_READ') && hasEstructura;
        const canAulas = has('AULAS_READ') && hasAulas;
        const canMaterias = has('MATERIAS_READ') && hasEstructura;
        const canGestionAcademica = canGestiones || canCursos || canParalelos || canAulas || canMaterias;

        // Operación académica (personas + inscripciones)
        const canDocentes = has('DOCENTES_READ') && hasOperacion;
        const canEstudiantes = has('ESTUDIANTES_READ') && hasOperacion;
        const canTutores = has('TUTORES_READ') && hasOperacion;
        const canPersonas = canDocentes || canEstudiantes || canTutores;

        const canInscripciones = has('INSCRIPCIONES_READ') && hasOperacion;
        const canAsignaciones = has('ASIGNACIONES_READ') && hasOperacion;
        const canHorarios = has('HORARIOS_READ') && hasHorarios;
        const canOperacion = canInscripciones || canAsignaciones || canHorarios;
        const canOperacionAdministrativa = canOperacion && !isDocente;

        const canMiArea = has('MI_AREA_READ') || isDocente || isEstudiante;

        const canBackups = isAdminInstitucion && hasRespaldo;
        const canReportes = (has('REPORTES_READ') || has('REPORTES_EXPORT') || has('REPORTES_WRITE') || isAdminInstitucion || isDirector || hasRole('SECRETARIO')) && hasReportes;
        // TODO: Definir módulo real para alertas en el seed backend
        const canAlertas = false;
        const canComunicados = isAdminInstitucion || isDirector || hasRole('SECRETARIO') || hasRole('DOCENTE');
        const canPlanesPago = isAdminInstitucion || isDirector;

        const canAsistencia =
            (has('ASISTENCIA_READ') ||
            has('ASISTENCIA_READ_ALL') ||
            isDocente ||
            isAdminInstitucion ||
            isDirector) && hasAsistencia;

        const canCalificaciones =
            (has('CALIFICACIONES_READ') ||
            has('CALIFICACIONES_READ_ALL') ||
            isDocente ||
            isAdminInstitucion ||
            isDirector) && hasCalificaciones;

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
            }

            if ((isAdminInstitucion || isDirector) && hasSeguridad) {
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

            if (canEstudiantes && hasOperacion) {
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

            if ((isDocente || has('ASIGNACIONES_READ')) && hasOperacion) {
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

            if ((isEstudiante || has('ESTUDIANTES_READ') || isDocente || isDirector) && hasOperacion) {
                miAreaItems.push(
                    { label: 'Historial Académico', icon: 'pi pi-fw pi-book', routerLink: ['/historial'] },
                );
            }

            menu.push({
                label: 'Mi área',
                items: miAreaItems,
            });
        }

        if (canBackups || canReportes || canAlertas || canComunicados || canPlanesPago) {
            menu.push({ separator: true });

            const herramientasItems: MenuItem[] = [];

            if (canComunicados) {
                herramientasItems.push({ label: 'Comunicados', icon: 'pi pi-fw pi-megaphone', routerLink: ['/comunicados'] });
            }

            if (canReportes) {
                herramientasItems.push({ label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'] });
            }

            if (canAlertas) {
                herramientasItems.push({ label: 'Alertas de Riesgo', icon: 'pi pi-fw pi-exclamation-triangle', routerLink: ['/alertas'] });
            }

            if (canPlanesPago) {
                herramientasItems.push({ label: 'Planes de Pago', icon: 'pi pi-fw pi-credit-card', routerLink: ['/planes-pago'] });
            }

            if (canBackups) {
                herramientasItems.push({ label: 'Respaldos', icon: 'pi pi-fw pi-database', routerLink: ['/backups'] });
            }

            menu.push({ label: 'Herramientas', items: herramientasItems });
        }

        return menu;
    }
}
