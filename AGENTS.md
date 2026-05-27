# SI2-SIA Frontend — Agent Instructions

Frontend Angular del **Sistema de Información Académica (SIA)** para la UAGRM.  
Stack: Angular 21 · PrimeNG 20 · Tailwind CSS 4 · TypeScript 5.9 · Karma/Jasmine.

---

## Comandos esenciales

```bash
npm start            # Dev server → http://localhost:4200
npm run build        # Build desarrollo
npm run build:prod   # Build producción
npm test             # Unit tests (Karma + Jasmine)
npm run format       # Prettier sobre *.ts, *.html, *.js
```

> El backend Spring Boot corre en `http://localhost:2026` (dev).  
> Ver [`src/environments/environment.ts`](src/environments/environment.ts).

---

## Arquitectura y estructura

```
src/app/
  core/
    guards/      # authGuard, superadminGuard, loggedGuard
               # permissionGuard(...perms)       — factory; requiere al menos uno de los permisos
               # permissionOrRoleGuard(perms, roles) — factory; acceso si tiene permiso O rol
    http/        # http-api.ts (legacy, NO usar para servicios nuevos), oauth2.interceptor.ts
    models/      # api-response.model.ts, sia.models.ts, auth.model.ts
    services/    # auth, menu, sia, asistencia, calificacion, horario, dashboard,
               #  saas, solicitud, authz, auditoria, respaldo, role, reporte, ...
  features/
    admin/       # Rutas SUPER_ADMIN (/admin)
      saas/      #   planes/, suscripciones/, solicitudes/ (gestión global SaaS)
    sia/         # Rutas autenticadas (raíz /)
      # Sprint 1: cursos, paralelos, materias, gestiones, docentes, estudiantes,
      #           tutores, inscripciones, asignaciones, configuracion
      # Sprint 2: aulas, horarios, asistencia, calificaciones, historial
      # Sprint Especial: suscripcion, seguridad, roles, auditoria, backups, reportes
    perfil/
  layout/        # Shell de la app (topbar, sidebar, menú)
  pages/
    auth/        # Login y recuperación de contraseña
    landing/     # Página pública SaaS (/solicitud) — muestra planes y formulario pre-venta
    dashboard, notfound, empty
  shared/        # PrimeNGModule, SharedModule, componentes/utils reutilizables
```

**Path alias**: `@/*` → `src/app/*`  
Ejemplo: `import { AppLayout } from '@/layout/component/app.layout';`

---

## Convenciones de código

- **Componentes standalone** — No usar NgModules propios; importar módulos de PrimeNG directamente o a través de `SharedModule`.
- **Lazy loading** — Todas las rutas de features usan `loadComponent()` o `loadChildren()`.
- **Inyección de dependencias** — Usar `inject()` en servicios core, guards y features SIA/Admin. El código de `src/app/pages/**` es mayormente demo legacy y no define el estándar del proyecto.
- **Signals** — Usar `signal()` / `computed()` para estado reactivo local.
- **BehaviorSubject** — Solo en servicios que exponen observables públicos (ejemplo: `AuthService.currentUser$`), manteniendo además signal de solo lectura para consumo reactivo.
- **Respuestas HTTP** — Siempre tipadas con `ApiResponse<T>` ([`src/app/core/models/api-response.model.ts`](src/app/core/models/api-response.model.ts)). Verificar `response.codigo === 200`.
- **Endpoints API** — Definidos en [`src/app/core/http/http-api.ts`](src/app/core/http/http-api.ts) como estáticos de `HttpApi`. Agregar nuevos endpoints ahí.
- **Modelos de dominio** — En [`src/app/core/models/sia.models.ts`](src/app/core/models/sia.models.ts).

---

## Patrones reactivos

- **Layout reactivo** — [`src/app/layout/service/layout.service.ts`](src/app/layout/service/layout.service.ts) es la referencia para combinar `signal()`, `computed()` y `effect()`.
- **Menú por rol** — [`src/app/core/services/menu.service.ts`](src/app/core/services/menu.service.ts) recalcula `items` con `computed()` a partir de `currentUserSignal()`.
- **Estado de autenticación** — [`src/app/core/services/auth.service.ts`](src/app/core/services/auth.service.ts) mantiene patrón dual: observable público + signal readonly.

---

## Autenticación y roles

- Token JWT almacenado en `localStorage` bajo la clave `sia_token` (configurable en `environment.auth.tokenKey`).
- El interceptor [`oauth2Interceptor`](src/app/core/http/oauth2.interceptor.ts) adjunta `Authorization: Bearer <token>` automáticamente, excepto en rutas públicas (`/auth/login`) y rutas QR (`/qr-proxy`).
- **Roles**: `SUPER_ADMIN` → `/admin`; resto → rutas SIA raíz. Ruta `/solicitud` es completamente pública (landing pre-ventas).
- Guards disponibles:
  - `authGuard` — requiere token válido
  - `superadminGuard` — requiere rol `SUPER_ADMIN`
  - `loggedGuard` — redirige si ya está autenticado (login page)
  - `permissionGuard(...perms)` — factory; acceso si tiene **alguno** de los permisos dados
  - `permissionOrRoleGuard(perms, roles)` — factory; acceso si tiene permiso **o** rol listado
- `ROLE_PERMISSION_FALLBACK` en `auth.service.ts` (líneas 18–58) asigna permisos por defecto según rol cuando el JWT no los incluye. Es deuda técnica pero actualmente necesario.

---

## UI / Estilos

- **PrimeNG**: módulos centralizados en [`src/app/shared/primeng.module.ts`](src/app/shared/primeng.module.ts). Tema: **Aura** (oscuro: clase `.app-dark`).
- **Tailwind CSS 4** con plugin `tailwindcss-primeui` ([`tailwind.config.js`](tailwind.config.js)).
- Estilos globales: [`src/assets/styles.scss`](src/assets/styles.scss).
- Usar clases Tailwind utilitarias; evitar estilos en línea.

---

## Proxy de desarrollo

El archivo [`proxy.conf.json`](proxy.conf.json) redirige `/qr-proxy` → `https://vpay.com.bo:7778/test/api`.  
Rutas QR gestionan su propio header `Authorization` (no usar el interceptor global).

---

## Pitfalls conocidos

- Dependencias Angular con versión mixta en [`package.json`](package.json): hay paquetes en v21 y otros en v20 (`@angular/forms`, `@angular/platform-browser-dynamic`). Antes de tareas de upgrade o debugging complejo, validar compatibilidad y planificar alineación de versiones.

---

## Servicios Sprint 2

Nuevos servicios en `src/app/core/services/`:
- `asistencia.service.ts` — sesiones de asistencia y registros por lote
- `calificacion.service.ts` — tipos de evaluación, evaluaciones y calificaciones
- `horario.service.ts` — horarios de clase; manejar 409 con mensaje de conflicto de franja
- `dashboard.service.ts` — métricas y resúmenes por institución

---

## Servicios Sprint Especial (implementados)

- `saas.service.ts` — planes y módulos del sistema (`GET /planes`, `POST/PUT/DELETE /planes/:id`); solo SUPER_ADMIN para mutaciones
- `solicitud.service.ts` — envío del formulario público pre-ventas (`POST /solicitudes`); usado por `LandingComponent`
- `authz.service.ts` — mapa de privilegios UI (`GET /api/privilegios-ui/mi-mapa`); `canView(modulo, entidad, campo)` y `canEdit(...)`. Cargar tras login exitoso con `cargarMapa()`; limpiar en logout con `limpiarMapa()`.
- `respaldo.service.ts` — backups y restauraciones (`GET/POST /respaldos`, `GET/POST /restauraciones`)
- `auditoria.service.ts` — bitácora con filtros (`GET /auditoria?modulo=&tipoOperacion=&exito=&idUsuario=&fechaDesde=&fechaHasta=`)
- `role.service.ts` — CRUD de roles dinámicos (`GET /roles`, `GET /roles/asignables`, `GET /roles/permisos`, `POST/PUT/DELETE /roles/:id`)
- `reporte.service.ts` — generación y descarga de reportes (`GET /reportes`)
- `empresa.service.ts` — **@deprecated** legacy, no usar en código nuevo

> **Patrón de URLs**: Los servicios nuevos construyen la URL base desde `environment.api.baseUrl` directamente. `http-api.ts` tiene contenido legacy (Django) que no se usa; no agregar nuevos servicios SIA ahí.

Features en `features/sia/` (Sprint Especial):
- `suscripcion/mi-plan.component.ts` — consulta del plan activo de la institución
- `seguridad/seguridad.component.ts` — intentos de login fallidos
- `auditoria/auditoria.component.ts` — vista de bitácora con filtros
- `backups/backups.component.ts` — gestión de respaldos y restauraciones
- `reportes/reportes.component.ts` — generación de reportes
- `roles/roles.component.ts` — gestión de roles y permisos dinámicos

Features en `features/admin/saas/` (SUPER_ADMIN):
- `planes/admin-planes.component.ts` — CRUD de planes de suscripción
- `suscripciones/admin-suscripciones.component.ts` — gestión de suscripciones activas
- `solicitudes/admin-solicitudes.component.ts` — aprobar/rechazar solicitudes de acceso

**`AuthzService` (implementado, HU-SE-07):** mapa en signal, cargado desde `GET /api/privilegios-ui/mi-mapa` al iniciar sesión. Llamar `authz.cargarMapa()` en el pipe de `login()` y `authz.limpiarMapa()` en `logout()`. Las directivas `*appCanView` y `[appCanEdit]` aún están pendientes de crear.

---

## Deuda técnica pendiente

> Ver checklist completo: [`si2-g2-backend-springboot/docs/checklist sprint especial.md`](../si2-g2-backend-springboot/docs/checklist%20sprint%20especial.md)

- Crear directivas `*appCanView` y `[appCanEdit]` que consuman `AuthzService.canView/canEdit`.
- `ROLE_PERMISSION_FALLBACK` hardcodeado en `auth.service.ts` (líneas 18–58): reemplazar cuando el backend incluya permisos en el JWT.
- `http-api.ts` contiene endpoints legacy (Django, `catalog/`, `sales/`): limpiar cuando no haya dependencias.

---

## Documentación adicional

- [docs/api-endpoints sprint 1.md](docs/api-endpoints%20sprint%201.md)
- [docs/api-endpoints sprint 2.md](docs/api-endpoints%20sprint%202.md)
- [docs/checklist sprint 1.md](docs/checklist%20sprint%201.md)
- [docs/checklist sprint 2.md](docs/checklist%20sprint%202.md)
- [si2-g2-backend-springboot/docs/checklist sprint especial.md](../si2-g2-backend-springboot/docs/checklist%20sprint%20especial.md)
