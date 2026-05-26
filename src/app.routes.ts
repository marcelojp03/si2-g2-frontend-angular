import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { AppLayout } from '@/layout/component/app.layout';
import { authGuard } from './app/core/guards/auth.guard';
import { superadminGuard } from './app/core/guards/superadmin.guard';
import { permissionGuard } from './app/core/guards/permission.guard';

export const appRoutes: Routes = [
    {
        path: 'admin',
        component: AppLayout,
        canActivate: [superadminGuard],
        children: [
            { path: 'roles', loadComponent: () => import('./app/features/sia/roles/roles.component').then(m => m.RolesComponent) },
            { path: '', loadChildren: () => import('./app/features/admin/admin.routes') },
        ]
    },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: 'roles', canActivate: [permissionGuard('ROLES_READ', 'ROLES_WRITE')], loadComponent: () => import('./app/features/sia/roles/roles.component').then(m => m.RolesComponent) },
            { path: '', loadChildren: () => import('./app/features/sia/sia.routes') },
        ]
    },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'solicitud', loadComponent: () => import('./app/pages/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
