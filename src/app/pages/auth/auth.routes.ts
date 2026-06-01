import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { ForgotPassword } from './forgot-password';
import { loggedResolver } from '@/core/guards/logged.guard';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'login', component: Login, resolve: { logged: loggedResolver } },
    { path: 'crear-contrasena', loadComponent: () => import('./crear-contrasena/crear-contrasena').then(m => m.CrearContrasena) },
] as Routes;
