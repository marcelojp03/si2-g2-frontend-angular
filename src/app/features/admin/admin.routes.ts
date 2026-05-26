import { Routes } from '@angular/router';

export default [
    { path: '', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
    { path: 'instituciones', loadComponent: () => import('./instituciones/admin-instituciones.component').then(m => m.AdminInstitucionesComponent) },
    { path: 'usuarios', loadComponent: () => import('./usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
    { path: 'roles', loadComponent: () => import('../sia/roles/roles.component').then(m => m.RolesComponent) },
    { path: 'auditoria', loadComponent: () => import('../sia/auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
    { path: 'saas/planes', loadComponent: () => import('./saas/planes/admin-planes.component').then(m => m.AdminPlanesComponent) },
    { path: 'saas/suscripciones', loadComponent: () => import('./saas/suscripciones/admin-suscripciones.component').then(m => m.AdminSuscripcionesComponent) },
    { path: 'saas/solicitudes', loadComponent: () => import('./saas/solicitudes/admin-solicitudes.component').then(m => m.AdminSolicitudesComponent) },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;
