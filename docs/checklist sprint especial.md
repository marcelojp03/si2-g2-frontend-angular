# Checklist Sprint Especial — Frontend Angular

> Vista detallada de tareas frontend del Sprint Especial SaaS.  
> Checklist combinado (backend + frontend): [`checklist sprint especial.md`](../../checklist%20sprint%20especial.md)

---

## Estado por feature

| Feature | Ruta Angular | Roles | Estado |
|---|---|---|---|
| `planes/` | `/sia/suscripcion` (info) / admin | `SUPER_ADMIN` | ✅ Completado |
| `suscripcion/` | `/sia/suscripcion` | `ADMIN_INSTITUCION`, `DIRECTOR` | ✅ Completado |
| `roles/` | `/sia/roles` | `ADMIN_INSTITUCION` | ✅ Completado |
| `auditoria/` | `/sia/auditoria` | `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR` | ✅ Completado |
| `seguridad/` | `/sia/seguridad` | `SUPER_ADMIN`, `ADMIN_INSTITUCION` | ✅ Completado |
| `backups/` | `/sia/backups` | `SUPER_ADMIN`, `ADMIN_INSTITUCION` | ✅ Completado |
| `reportes/` | `/sia/reportes` | `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO` | ✅ Completado |
| Admin SaaS Planes | `/admin/saas/planes` | `SUPER_ADMIN` | ✅ Completado |
| Admin SaaS Suscripciones | `/admin/saas/suscripciones` | `SUPER_ADMIN` | ✅ Completado |
| Admin SaaS Solicitudes | `/admin/saas/solicitudes` | `SUPER_ADMIN` | ✅ Completado |
| Landing Solicitud | `/solicitud` | Público | ✅ Completado |

---

## HU-SE-01 — Hardening JWT (frontend)

- [x] `AuthResponse` incluye `roles` y `permisos` — extraídos en `auth.service.ts`
- [x] `plan_codigo` y `modulos_activos` disponibles en JWT claims (decodificables)
- [x] Mostrar `plan_codigo` en topbar (badge visual + ítem en menú de usuario)
- [x] `UsuarioSIA` extendido con `planCodigo` y `modulosActivos`
- [x] Eliminado `ROLE_PERMISSION_FALLBACK` hardcodeado — permisos 100% desde JWT claims

---

## HU-SE-02 — Planes (frontend)

- [x] `admin-planes.component.ts` — CRUD completo (SUPER_ADMIN)
- [x] `saas.service.ts` — `listarPlanes()`, `crearPlan()`, `actualizarPlan()`
- [x] `PlanSuscripcion` en `sia.models.ts`

---

## HU-SE-03 — Suscripción (frontend)

- [x] `mi-plan.component.ts` — muestra plan activo, límites, módulos
- [x] `suscripcion.service.ts` — `obtenerPlanActivo()`, `suscribir()`
- [x] `SuscripcionInstitucion` en `sia.models.ts`

---

## HU-SE-04 — Configuración paramétrica (frontend)

- [x] `configuracion.component.ts` — sección "Reglas académicas" con umbral aprobación + % asistencia
- [x] Validación de rangos en formulario

---

## HU-SE-05/06 — Roles dinámicos + permisos (frontend)

- [x] `roles.component.ts` — tabla roles, crear/editar roles institucionales
- [x] Indicador visual: global (solo lectura) vs. institucional (editable)
- [x] Pestaña "Permisos del rol" con checkboxes por módulo

---

## HU-SE-07 — Privilegios UI (frontend)

- [x] `authz.service.ts` — carga mapa de privilegios al login, expone `canView()`, `canEdit()`
- [x] `can-view.directive.ts` — `*appCanView="[modulo, entidad, campo]"` (oculta del DOM)
- [x] `can-edit.directive.ts` — `[appCanEdit]="[modulo, entidad, campo]"` (deshabilita input)
- [x] Demo aplicado en `estudiantes.component.ts`
- [x] Panel de administración en `roles.component.ts`

---

## HU-SE-08 — Auditoría (frontend)

- [x] `auditoria.component.ts` — tabla con filtros: módulo, operación, fecha, usuario, éxito/fallo
- [x] Paginación server-side

---

## HU-SE-09 — Intentos de login (frontend)

- [x] `seguridad.component.ts` — tabla intentos con filtro solo-fallos
- [x] Badge de advertencia para correos con múltiples fallos

---

## HU-SE-10 — Backups (frontend)

- [x] `backups.component.ts` — lista backups con estado, botón "Iniciar backup"
- [x] Lista solicitudes de restauración
- [x] Formulario solicitar restauración (selector backup + motivo)
- [x] SUPER_ADMIN: botón aprobar/rechazar restauración
- [x] `respaldo.service.ts`

---

## HU-SE-11/12/13 — Reportes (frontend)

- [x] `reportes.component.ts` — tabs: Asistencia / Calificaciones / Inscripciones
- [x] Panel de filtros previo por tipo
- [x] Tabla de resultados (solo al pulsar "Generar")
- [x] Pestaña Gerencial: KPIs + tabla resumen
- [x] Pestaña Dinámico: selector plantilla + columnas + filtros + guardar
- [x] **Pestaña Consulta IA** (HU-SE-13): textarea lenguaje natural → SQL generado (gpt-4o-mini) → tabla dinámica de resultados
- [x] `reporte.service.ts` — `consultaNatural()` + `ConsultaNaturalResponse`

---

## Deuda técnica resuelta

- [x] Eliminado `http-api.ts` (endpoints legacy Django catalog/sales/inventory/analytics — código muerto)
- [x] Eliminado `ROLE_PERMISSION_FALLBACK` hardcodeado en `auth.service.ts`
- [x] Build TypeScript limpio (`ngc --noEmit` exit 0)

---

## Directivas disponibles

```typescript
// Ocultar campo si no tiene visibilidad
<div *appCanView="['estudiante', 'estudiante', 'documento_identidad']">...</div>

// Deshabilitar input si no es editable
<input [appCanEdit]="['estudiante', 'estudiante', 'correo']" />
```

---

## Servicios creados

| Servicio | Archivo | Descripción |
|---|---|---|
| `SaasService` | `core/services/saas.service.ts` | Planes de suscripción |
| `SuscripcionService` | `core/services/suscripcion.service.ts` | Plan activo, suscribir |
| `SolicitudService` | `core/services/solicitud.service.ts` | Onboarding solicitudes |
| `AuthzService` | `core/services/authz.service.ts` | Privilegios UI por usuario |
| `RespaldoService` | `core/services/respaldo.service.ts` | Backups + restauraciones |
| `ReporteService` | `core/services/reporte.service.ts` | Todos los tipos de reporte |

---

## Deuda técnica pendiente

- [x] Eliminar `ROLE_PERMISSION_FALLBACK` hardcodeado en `auth.service.ts` — **resuelto**
- [x] Eliminar `http-api.ts` completo (endpoints legacy Django — cero importaciones confirmadas) — **resuelto**
- [x] Mostrar `plan_codigo` en topbar (badge + ítem en menú usuario) — **resuelto**
