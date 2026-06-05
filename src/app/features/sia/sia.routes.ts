import { Routes } from '@angular/router';
import { permissionGuard } from '@/core/guards/permission.guard';
import { permissionOrRoleGuard } from '@/core/guards/permission-or-role.guard';

export default [
    { path: '', loadComponent: () => import('./dashboard/sia-dashboard.component').then(m => m.SiaDashboardComponent) },
    { path: 'usuarios', canActivate: [permissionGuard('USUARIOS_READ')], loadComponent: () => import('../admin/usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
    { path: 'configuracion', canActivate: [permissionGuard('CONFIGURACION_READ')], loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent) },
    { path: 'auditoria', canActivate: [permissionOrRoleGuard(['AUDITORIA_READ'], ['ADMIN_INSTITUCION', 'DIRECTOR'])], loadComponent: () => import('./auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
    { path: 'suscripcion', canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION', 'DIRECTOR'])], loadComponent: () => import('./suscripcion/mi-plan.component').then(m => m.MiPlanComponent) },
    { path: 'seguridad', canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION', 'DIRECTOR'])], loadComponent: () => import('./seguridad/seguridad.component').then(m => m.SeguridadComponent) },
    { path: 'gestiones', canActivate: [permissionGuard('GESTIONES_READ')], loadComponent: () => import('./gestiones/gestiones.component').then(m => m.GestionesComponent) },
    { path: 'gestiones/periodos', canActivate: [permissionGuard('GESTIONES_READ')], loadComponent: () => import('./gestiones/periodos/gestion-periodos.component').then(m => m.GestionPeriodosComponent) },
    { path: 'cursos', canActivate: [permissionGuard('CURSOS_READ')], loadComponent: () => import('./cursos/cursos.component').then(m => m.CursosComponent) },
    { path: 'paralelos', canActivate: [permissionGuard('PARALELOS_READ')], loadComponent: () => import('./paralelos/paralelos.component').then(m => m.ParalelosComponent) },
    { path: 'aulas', canActivate: [permissionGuard('AULAS_READ')], loadComponent: () => import('./aulas/aulas.component').then(m => m.AulasComponent) },
    { path: 'materias', canActivate: [permissionGuard('MATERIAS_READ')], loadComponent: () => import('./materias/materias.component').then(m => m.MateriasComponent) },
    { path: 'materias-curso', canActivate: [permissionGuard('MATERIAS_READ')], loadComponent: () => import('./materias-curso/materias-curso.component').then(m => m.MateriasCursoComponent) },
    { path: 'docentes', canActivate: [permissionGuard('DOCENTES_READ')], loadComponent: () => import('./docentes/docentes.component').then(m => m.DocentesComponent) },
    { path: 'estudiantes', canActivate: [permissionGuard('ESTUDIANTES_READ')], loadComponent: () => import('./estudiantes/estudiantes.component').then(m => m.EstudiantesComponent) },
    { path: 'tutores', canActivate: [permissionGuard('TUTORES_READ')], loadComponent: () => import('./tutores/tutores.component').then(m => m.TutoresComponent) },
    { path: 'inscripciones', canActivate: [permissionGuard('INSCRIPCIONES_READ')], loadComponent: () => import('./inscripciones/inscripciones.component').then(m => m.InscripcionesComponent) },
    { path: 'asignaciones', canActivate: [permissionGuard('ASIGNACIONES_READ')], loadComponent: () => import('./asignaciones/asignaciones.component').then(m => m.AsignacionesComponent) },
    { path: 'horarios', canActivate: [permissionGuard('HORARIOS_READ')], loadComponent: () => import('./horarios/gestion-horarios.component').then(m => m.GestionHorariosComponent) },
    { path: 'historial', canActivate: [permissionOrRoleGuard(['ESTUDIANTES_READ', 'MI_AREA_READ'], ['ADMIN_INSTITUCION', 'DIRECTOR', 'DOCENTE'])], loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent) },
    { path: 'reportes', canActivate: [permissionOrRoleGuard(['REPORTES_READ', 'REPORTES_EXPORT', 'REPORTES_WRITE'], ['ADMIN_INSTITUCION', 'DIRECTOR', 'SECRETARIO'])], loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent) },
    { path: 'alertas', canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION', 'DIRECTOR', 'SECRETARIO'])], loadComponent: () => import('./alertas/alertas-riesgo.component').then(m => m.AlertasRiesgoComponent) },
    { path: 'backups', canActivate: [permissionOrRoleGuard([], ['ADMIN_INSTITUCION'])], loadComponent: () => import('./backups/backups.component').then(m => m.BackupsComponent) },

    {
        path: 'asistencia',
        canActivate: [permissionOrRoleGuard(
            ['ASISTENCIA_READ', 'ASISTENCIA_READ_ALL', 'MI_AREA_READ'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'DOCENTE']
        )],
        loadComponent: () => import('./asistencia/asistencia.component').then(m => m.AsistenciaComponent)
    },
    {
        path: 'calificaciones',
        canActivate: [permissionOrRoleGuard(
<<<<<<< HEAD
            ['CALIFICACIONES_READ', 'CALIFICACIONES_WRITE', 'CALIFICACIONES_READ_ALL', 'MI_AREA_READ'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'DOCENTE', 'ESTUDIANTE']
        )],
        loadComponent: () => import('./calificaciones/calificaciones.component').then(m => m.CalificacionesComponent)
    },
    {
        path: 'historial',
        canActivate: [permissionOrRoleGuard(
            [],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'SECRETARIO', 'DOCENTE', 'ESTUDIANTE']
        )],
        loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent)
    },


    { path: 'roles', canActivate: [permissionGuard('ROLES_READ', 'ROLES_WRITE')], loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },
    { path: 'auditoria', canActivate: [permissionOrRoleGuard(['AUDITORIA_READ'], ['SUPER_ADMIN'])], loadComponent: () => import('./auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
    {
        path: 'reportes',
        canActivate: [permissionOrRoleGuard(
            ['REPORTES_READ', 'REPORTES_EXPORT', 'REPORTES_WRITE'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'SECRETARIO', 'DOCENTE']
        )],
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent)
    },
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
=======
            ['CALIFICACIONES_READ', 'CALIFICACIONES_READ_ALL', 'MI_AREA_READ'],
            ['ADMIN_INSTITUCION', 'SUPER_ADMIN', 'DIRECTOR', 'DOCENTE']
        )],
        loadComponent: () => import('./calificaciones-periodo/calificaciones-periodo.component').then(m => m.CalificacionesPeriodoComponent)
>>>>>>> 2d3de50 (feat: periodos y dimensiones UI, permisos reactivos, roles fix, routes restore)
    },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;
