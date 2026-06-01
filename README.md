# SI2 G2 — Frontend Angular

[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.dev/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-20-blue.svg)](https://primeng.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org/)
[![AWS](https://img.shields.io/badge/Deploy-S3_+_CloudFront-232F3E.svg)](https://aws.amazon.com/cloudfront/)

Frontend web del Sistema de Gestión Académica SaaS — UAGRM Sistemas de Información 2, Grupo 2.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 |
| UI | PrimeNG 20 |
| Estilos | Tailwind CSS 4 + SCSS |
| Lenguaje | TypeScript 5.9 |
| Estado reactivo | Signals (`signal()`, `computed()`) |
| HTTP | `HttpClient` con interceptor JWT |
| Deploy | AWS S3 + CloudFront |

---

## Requisitos previos

- Node.js >= 22
- npm >= 10

---

## Levantar el servidor de desarrollo

```bash
cd si2-g2-frontend-angular
npm install
npm start
```

La app queda disponible en `http://localhost:4200/`. Se recarga automáticamente al guardar.

El proxy hacia el backend local está configurado en `proxy.conf.json`.

---

## Comandos

```bash
npm start              # Dev server → localhost:4200
npm run build:prod     # Build producción (dist/)
npm test               # Tests Karma + Jasmine
npm run format         # Prettier
npx tsc --noEmit       # Verificar tipos sin compilar
```

---

## Variables de entorno

Las URLs del backend se configuran en:

```
src/environments/
├── environment.ts          # Local  → http://localhost:2026
└── environment.prod.ts     # Prod   → https://s7hwsnmsxf.us-east-1.awsapprunner.com
```

---

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/       — authGuard, roleGuard, superadminGuard, loggedGuard
│   ├── models/       — api-response.model, auth.model, sia.models
│   └── services/     — auth, menu, institucion, sia, storage, usuario,
│                        asistencia, calificacion, horario, dashboard,
│                        saas, solicitud, authz, auditoria, respaldo, role, reporte
├── features/
│   ├── admin/        — Panel Super Admin (instituciones, usuarios globales, planes)
│   ├── perfil/       — Perfil de usuario
│   └── sia/          — Módulos académicos (lazy loading)
│       ├── cursos/, paralelos/, materias/, materias-curso/
│       ├── gestiones/, docentes/, estudiantes/, tutores/
│       ├── inscripciones/, asignaciones/, configuracion/, dashboard/
│       ├── aulas/, horarios/, asistencia/, calificaciones/, historial/
│       ├── suscripcion/, seguridad/, roles/, auditoria/, backups/, reportes/, planes/
│       └── alertas/   — IA y alertas tempranas (ia.service.ts scoped a feature)
├── layout/           — AppLayout, topbar (badge plan), sidebar, menú dinámico por rol
├── pages/            — auth (login), dashboard, notfound, empty
└── shared/           — PrimeNGModule, SharedModule, FileUploadComponent, utils
```

---

## Auth y multi-tenant

- JWT stateless con `Bearer` token
- Claims del token: `id_institucion`, `roles[]`, `permisos[]`, `plan_codigo`, `modulos_activos[]`
- `authGuard` protege todas las rutas autenticadas
- `roleGuard` restringe acceso por rol (`ADMIN_INSTITUCION`, `DOCENTE`, etc.)
- `superadminGuard` bloquea rutas del panel `/admin` a no super-admins

---

## Deploy

```powershell
# Build y subir a S3
npm run build:prod
.\deploy-s3.ps1
```

| Entorno | URL |
|---|---|
| Local | `http://localhost:4200` |
| Producción | `https://d32gr4vkubb6g5.cloudfront.net` |
