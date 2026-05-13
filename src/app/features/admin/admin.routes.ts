import { Routes } from '@angular/router';

export default [
    { path: '', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
    { path: 'instituciones', loadComponent: () => import('./instituciones/admin-instituciones.component').then(m => m.AdminInstitucionesComponent) },
    { path: 'usuarios', loadComponent: () => import('./usuarios/admin-usuarios.component').then(m => m.AdminUsuariosComponent) },
    { path: 'roles', loadComponent: () => import('../sia/roles/roles.component').then(m => m.RolesComponent) },
    { path: 'auditoria', loadComponent: () => import('../sia/auditoria/auditoria.component').then(m => m.AuditoriaComponent) },
    { path: 'perfil', loadChildren: () => import('../perfil/perfil.routes') },
] as Routes;
