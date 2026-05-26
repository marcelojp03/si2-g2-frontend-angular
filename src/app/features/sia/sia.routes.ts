import { Routes } from '@angular/router';
import { permissionGuard } from '@/core/guards/permission.guard';
import { permissionOrRoleGuard } from '@/core/guards/permission-or-role.guard';

export default [
    { path: '', loadComponent: () => import('./dashboard/sia-dashboard.component').then(m => m.SiaDashboardComponent) },
    { path: 'usuarios', loadComponent: () => import('../admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
    { path: 'gestiones', loadComponent: () => import('./gestiones/gestiones.component').then(m => m.GestionesComponent) },
    { path: 'cursos', loadComponent: () => import('./cursos/cursos.component').then(m => m.CursosComponent) },
    { path: 'paralelos', loadComponent: () => import('./paralelos/paralelos.component').then(m => m.ParalelosComponent) },
    { path: 'aulas', canActivate: [permissionGuard('GESTION_READ', 'GESTION_WRITE')], loadComponent: () => import('./aulas/aulas.component').then(m => m.AulasComponent) },
    { path: 'materias', loadComponent: () => import('./materias/materias.component').then(m => m.MateriasComponent) },
    { path: 'materias-curso', loadComponent: () => import('./materias-curso/materias-curso.component').then(m => m.MateriasCursoComponent) },
    { path: 'docentes', loadComponent: () => import('./docentes/docentes.component').then(m => m.DocentesComponent) },
    { path: 'estudiantes', loadComponent: () => import('./estudiantes/estudiantes.component').then(m => m.EstudiantesComponent) },
    { path: 'tutores', loadComponent: () => import('./tutores/tutores.component').then(m => m.TutoresComponent) },
    { path: 'inscripciones', loadComponent: () => import('./inscripciones/inscripciones.component').then(m => m.InscripcionesComponent) },
    { path: 'asignaciones', loadComponent: () => import('./asignaciones/asignaciones.component').then(m => m.AsignacionesComponent) },
    { path: 'horarios', canActivate: [permissionGuard('GESTION_READ', 'GESTION_WRITE')], loadComponent: () => import('./horarios/gestion-horarios.component').then(m => m.GestionHorariosComponent) },

    {
        path: 'asistencia',
        canActivate: [permissionOrRoleGuard(
            ['ASISTENCIA_READ', 'ASISTENCIA_WRITE', 'ASISTENCIA_READ_ALL', 'MI_AREA_READ'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'DOCENTE']
        )],
        loadComponent: () => import('./asistencia/asistencia.component').then(m => m.AsistenciaComponent)
    },
    {
        path: 'calificaciones',
        canActivate: [permissionOrRoleGuard(
            ['CALIFICACIONES_READ', 'CALIFICACIONES_WRITE', 'CALIFICACIONES_READ_ALL', 'MI_AREA_READ'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'DOCENTE']
        )],
        loadComponent: () => import('./calificaciones/calificaciones.component').then(m => m.CalificacionesComponent)
    },


    { path: 'roles', canActivate: [permissionGuard('ROLES_READ', 'ROLES_WRITE')], loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },
    { path: 'auditoria', canActivate: [permissionOrRoleGuard(['AUDITORIA_READ'], ['SUPER_ADMIN'])], loadComponent: () => import('./auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
    { path: 'configuracion', loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
    {
        path: 'suscripcion',
        canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION', 'DIRECTOR'])],
        loadComponent: () => import('./suscripcion/mi-plan.component').then(m => m.MiPlanComponent)
    },
    {
        path: 'seguridad',
        canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION', 'DIRECTOR'])],
        loadComponent: () => import('./seguridad/seguridad.component').then(m => m.SeguridadComponent)
    },
    {
        path: 'backups',
        canActivate: [permissionOrRoleGuard([], ['SUPER_ADMIN', 'ADMIN_INSTITUCION'])],
        loadComponent: () => import('./backups/backups.component').then(m => m.BackupsComponent)
    },
    {
        path: 'reportes',
        canActivate: [permissionOrRoleGuard(['REPORTES_READ'], ['SUPER_ADMIN', 'ADMIN_INSTITUCION', 'DIRECTOR', 'SECRETARIO'])],
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent)
    },
    {
        path: 'alertas',
        canActivate: [permissionOrRoleGuard([], ['SUPER_ADMIN', 'ADMIN_INSTITUCION', 'DIRECTOR', 'SECRETARIO'])],
        loadComponent: () => import('./alertas/alertas-riesgo.component').then(m => m.AlertasRiesgoComponent)
    },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;
