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
    guards/      # authGuard, superadminGuard, roleGuard, loggedGuard
    http/        # http-api.ts (endpoints estáticos), oauth2.interceptor.ts
    models/      # api-response.model.ts, sia.models.ts
    services/    # auth, menu, sia, asistencia, calificacion, horario, dashboard, ...
  features/
    admin/       # Rutas protegidas por superadminGuard (/admin)
    sia/         # Rutas protegidas por authGuard (raíz /)
      # Sprint 1: cursos, paralelos, materias, gestiones, docentes, estudiantes,
      #           tutores, inscripciones, asignaciones, configuracion
      # Sprint 2: aulas, horarios, asistencia, calificaciones, historial
      # Sprint Especial (en progreso): suscripcion, seguridad, roles, auditoria, backups, reportes, planes
    perfil/
  layout/        # Shell de la app (topbar, sidebar, menú)
  pages/         # Auth, dashboard, notfound, empty
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
- **Roles**: `SUPER_ADMIN` → `/admin`; resto → rutas SIA raíz.
- Guards disponibles: `authGuard`, `superadminGuard`, `roleGuard`, `loggedGuard`.

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

## Servicios Sprint Especial

- `saas.service.ts` — planes de suscripción y módulos del sistema (CRUD para SUPER_ADMIN)
- `solicitud.service.ts` — solicitudes de restauración y backups

Features en `features/sia/` ya creadas para este sprint:
- `suscripcion/` — componente "Mi Plan" (`mi-plan.component.ts`)
- `seguridad/` — vista de seguridad/intentos de login (`seguridad.component.ts`)

**Patrón `AuthzService` (HU-SE-07):** al implementar, cargar el mapa de privilegios desde `GET /api/privilegios-ui` al iniciar sesión. Usar directiva estructural `*appCanView` y directiva de atributo `[appCanEdit]` para controlar visibilidad por campo/botón sin duplicar formularios.

---

## Deuda técnica pendiente (Sprint Especial)

> Ver checklist completo: [`si2-g2-backend-springboot/docs/checklist sprint especial.md`](../si2-g2-backend-springboot/docs/checklist%20sprint%20especial.md)

- Eliminar `ROLE_PERMISSION_FALLBACK` hardcodeado en `auth.service.ts` (líneas 18–58).
- Limpiar endpoints legacy en `http-api.ts` (`catalog/`, `sales/`, `analyticsReports`).
- Agregar nuevos endpoints SaaS en `http-api.ts`: `planes`, `suscripcion`, `privilegios-ui`, `respaldos`, `restauraciones`, `reportes/`.

---

## Documentación adicional

- [docs/api-endpoints sprint 1.md](docs/api-endpoints%20sprint%201.md)
- [docs/api-endpoints sprint 2.md](docs/api-endpoints%20sprint%202.md)
- [docs/checklist sprint 1.md](docs/checklist%20sprint%201.md)
- [docs/checklist sprint 2.md](docs/checklist%20sprint%202.md)
- [si2-g2-backend-springboot/docs/checklist sprint especial.md](../si2-g2-backend-springboot/docs/checklist%20sprint%20especial.md)
