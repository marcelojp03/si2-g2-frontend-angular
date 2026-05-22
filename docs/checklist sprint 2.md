# Checklist Frontend — SI2 Grupo 2 · Sprint 2

> Stack: Angular 20/21 · PrimeNG · Tailwind CSS 4 · TypeScript · Reactive Forms · JWT  
> Arquitectura: standalone + feature-based + lazy loading  
> Integración: Backend Spring Boot (`/api/**`)

---

## Historias de usuario Sprint 2

| ID | Historia | SP | Estado |
|----|----------|----|--------|
| HU-S2-14 | Gestionar aulas | 3 | ⬜ Pendiente |
| HU-S2-15 | Gestionar horarios | 8 | ⬜ Pendiente |
| HU-S2-16 | Registrar asistencia | 5 | ⬜ Pendiente |
| HU-S2-17 | Consultar asistencia | 3 | ⬜ Pendiente |
| HU-S2-18 | Gestionar calificaciones | 8 | ⬜ Pendiente |
| HU-S2-19 | Consultar historial académico | 5 | ⬜ Pendiente |

**Total estimado:** 32 SP

---

## Bloque 1 — Modelos e interfaces (core)
> Agregar en `src/app/core/models/sia.models.ts`

- [ ] `AulaRequest`, `AulaResponse`
- [ ] `HorarioRequest`, `HorarioResponse`, `HorarioConflictoResponse`
- [ ] `SesionAsistenciaRequest`, `SesionAsistenciaResponse`
- [ ] `RegistroAsistenciaRequest`, `RegistroAsistenciaResponse`
- [ ] `TipoEvaluacionRequest`, `TipoEvaluacionResponse`
- [ ] `EvaluacionRequest`, `EvaluacionResponse`
- [ ] `RegistroCalificacionRequest`, `RegistroCalificacionResponse`
- [ ] `HistorialAcademicoResponse` (DTO agregado: gestión, materias, evaluaciones, notas, asistencia)

---

## Bloque 2 — Endpoints API (core)
> Agregar en `src/app/core/http/http-api.ts` clase `HttpApi`

- [ ] `static aulas = 'api/aulas'`
- [ ] `static horarios = 'api/horarios'`
- [ ] `static sesionesAsistencia = 'api/sesiones-asistencia'`
- [ ] `static tiposEvaluacion = 'api/tipos-evaluacion'`
- [ ] `static evaluaciones = 'api/evaluaciones'`
- [ ] Helpers de subrutas: sesión → registros, evaluación → calificaciones, estudiante → historial/asistencia

---

## Bloque 3 — Servicios (core)
> Pueden ir en `src/app/core/services/sia.service.ts` o en nuevos archivos por dominio

- [ ] `AulaService` — CRUD contra `/api/aulas`
- [ ] `HorarioService` — CRUD contra `/api/horarios`, manejar respuesta 409 con mensaje de conflicto
- [ ] `AsistenciaService`:
  - [ ] `abrirSesion()`, `cerrarSesion()`, `listarSesiones(filtros)`
  - [ ] `registrarAsistenciaBatch()`, `actualizarRegistro()`, `listarRegistrosSesion()`
  - [ ] `getAsistenciaEstudiante(idEstudiante, filtros)`
- [ ] `CalificacionService`:
  - [ ] CRUD para `TipoEvaluacion`
  - [ ] CRUD para `Evaluacion`
  - [ ] `registrarCalificacionesBatch()`, `actualizarCalificacion()`
- [ ] `HistorialService` — `getHistorial(idEstudiante, idGestion?)`

---

## Bloque 4 — Rutas SIA
> Actualizar `src/app/features/sia/sia.routes.ts`

- [ ] Agregar ruta lazy `aulas` → `AulasComponent`
- [ ] Agregar ruta lazy `horarios` → `HorariosComponent`
- [ ] Agregar rutas lazy `asistencia` → sub-rutas: sesiones / registrar / consultar
- [ ] Agregar ruta lazy `tipos-evaluacion` → `TiposEvaluacionComponent`
- [ ] Agregar rutas lazy `evaluaciones` → sub-rutas: lista / calificaciones
- [ ] Agregar ruta lazy `historial` → `HistorialComponent`

---

## Bloque 5 — Menú dinámico
> Actualizar `src/app/core/services/menu.service.ts`

- [ ] Agregar ítem "Aulas" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`
- [ ] Agregar ítem "Horarios" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`
- [ ] Agregar ítem "Asistencia" en menú para `DOCENTE`, `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`
- [ ] Agregar ítem "Calificaciones" en menú para `DOCENTE`, `ADMIN_INSTITUCION`, `SUPER_ADMIN`
- [ ] Agregar ítem "Historial" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

---

## Bloque 6 — HU-S2-14: Gestión de aulas
> Nuevo feature: `src/app/features/sia/aulas/`

- [ ] `aulas.component.ts` + `.html` — listado de aulas en tabla
  - [ ] Columnas: código, nombre, tipo, capacidad, ubicación, estado
  - [ ] Filtro por estado (ACTIVO/INACTIVO)
  - [ ] Botones: Nuevo, Editar, Desactivar (según rol)
- [ ] Modal o página de formulario de aula:
  - [ ] Campos: código, nombre, tipo_aula (dropdown), capacidad, ubicación
  - [ ] Validaciones reactive forms (código obligatorio, capacidad > 0)
  - [ ] Crear y editar con el mismo formulario
- [ ] Confirmación de desactivación
- [ ] Toast de éxito/error
- [ ] Estado vacío si no hay aulas

---

## Bloque 7 — HU-S2-15: Gestión de horarios
> Nuevo feature: `src/app/features/sia/horarios/`

- [ ] `horarios.component.ts` + `.html` — listado o vista semanal
  - [ ] Selector de paralelo y gestión para filtrar
  - [ ] Vista de tabla semanal (días como columnas, franjas horarias como filas) o lista plana
  - [ ] Mostrar: materia, docente, aula, día, hora inicio-fin por cada horario
- [ ] Formulario de horario:
  - [ ] Campos: paralelo (dropdown), materia (dropdown), docente (dropdown), aula (dropdown), día de semana, hora inicio, hora fin
  - [ ] Dropdowns poblados dinámicamente desde API (filtrados por gestión activa)
- [ ] Manejo de error 409 — mostrar mensaje descriptivo del conflicto (docente/aula/paralelo ocupado)
- [ ] Confirmación de eliminación
- [ ] Toast éxito/error

---

## Bloque 8 — HU-S2-16: Registro de asistencia
> Nuevo feature: `src/app/features/sia/asistencia/` — sub-vista de registro

- [ ] `sesiones-asistencia.component.ts` — listado de sesiones con filtros
  - [ ] Filtros: paralelo, materia, fecha, estado
  - [ ] Columnas: fecha, materia, paralelo, docente, estado (ABIERTA/CERRADA)
  - [ ] Botones: Nueva sesión, Ver registros, Cerrar sesión
- [ ] Formulario de apertura de sesión:
  - [ ] Campos: paralelo, materia, fecha, hora inicio (hora fin opcional)
  - [ ] Mostrar error si ya existe sesión abierta para ese paralelo+materia+fecha
- [ ] `registrar-asistencia.component.ts` — vista de registro de una sesión abierta
  - [ ] Tabla con lista de estudiantes inscritos en el paralelo
  - [ ] Selector por fila: PRESENTE / AUSENTE / TARDE / JUSTIFICADO
  - [ ] Selección masiva (marcar todos como PRESENTE)
  - [ ] Campo observación opcional por registro
  - [ ] Botón guardar (carga batch) con spinner
  - [ ] Botón "Cerrar sesión" con confirmación (desactiva edición)
- [ ] Toast éxito/error en cada operación

---

## Bloque 9 — HU-S2-17: Consulta de asistencia
> Sub-vista dentro de `src/app/features/sia/asistencia/`

- [ ] `consulta-asistencia.component.ts` — vista de consulta general
  - [ ] Filtros: paralelo, materia, gestión, rango de fechas
  - [ ] Tabla de sesiones con estado y cantidad de presentes/ausentes por sesión
- [ ] `detalle-sesion.component.ts` — detalle de registros de una sesión (solo lectura)
  - [ ] Tabla: estudiante, estado asistencia, observación
- [ ] `asistencia-estudiante.component.ts` — historial de asistencia de un estudiante
  - [ ] Selector de gestión y materia
  - [ ] Tabla por sesión: fecha, estado, observación
  - [ ] Resumen: total sesiones, presentes, % asistencia (badge o chip visual)
- [ ] Acceso según rol (ocultar botones de edición para rol de solo lectura)

---

## Bloque 10 — HU-S2-18: Gestión de calificaciones
> Nuevos features: `src/app/features/sia/tipos-evaluacion/` y `src/app/features/sia/calificaciones/`

### Tipos de evaluación
- [ ] Listado de tipos de evaluación (tabla simple)
- [ ] Modal de crear/editar: nombre, descripción, porcentaje
- [ ] Desactivar tipo

### Evaluaciones
- [ ] `evaluaciones.component.ts` — listado filtrado por paralelo, materia, gestión
  - [ ] Columnas: nombre, tipo, fecha, nota máxima, estado
  - [ ] Botones: Nueva, Editar, Ver calificaciones, Cerrar evaluación
- [ ] Formulario de evaluación:
  - [ ] Campos: nombre, paralelo, materia, tipo evaluación, fecha, nota máxima, descripción
  - [ ] Dropdowns dinámicos

### Calificaciones
- [ ] `calificaciones.component.ts` — vista de carga de notas de una evaluación
  - [ ] Tabla: una fila por estudiante inscrito en el paralelo
  - [ ] Input de nota por fila (validar 0 ≤ nota ≤ nota_maxima)
  - [ ] Campo observación opcional
  - [ ] Carga masiva (botón guardar envía batch completo)
  - [ ] Edición individual de nota ya registrada
  - [ ] Indicador visual: PENDIENTE (gris) / REGISTRADA (verde) / ANULADA (rojo)
- [ ] Toast éxito/error por operación

---

## Bloque 11 — HU-S2-19: Historial académico
> Nuevo feature: `src/app/features/sia/historial/`

- [ ] `historial.component.ts` — selector de estudiante + selector de gestión
  - [ ] Buscador de estudiante (autocomplete o dropdown)
  - [ ] Selector de gestión académica (opcional, default: gestión activa)
- [ ] Vista de resultado del historial:
  - [ ] Encabezado: datos del estudiante (nombre, código, estado)
  - [ ] Por cada materia: tabla de evaluaciones con nombre, tipo, fecha, nota obtenida, nota máxima
  - [ ] Resumen de asistencia por materia: total sesiones, presentes, % (badge con color según porcentaje)
  - [ ] Promedio general calculado en frontend o devuelto por el backend
- [ ] Estado vacío si no tiene historial en la gestión seleccionada

---

## Bloque 12 — UX mínima
> Consistente con estándares del Sprint 1

- [ ] Spinner global o por componente durante carga
- [ ] Toasts de éxito y error en todas las operaciones
- [ ] Confirmación en acciones destructivas (cerrar sesión, anular calificación)
- [ ] Estado vacío en todas las tablas nuevas
- [ ] Botones deshabilitados mientras se procesa el request
- [ ] Mensajes de error claros para 409 (conflicto), 403 (sin permiso), 404 (no encontrado)
- [ ] Inputs de nota: solo números, rango visible al usuario

---

## Bloque 13 — Seguridad frontend
> Consistente con guards existentes

- [ ] Nuevas rutas protegidas con `authGuard`
- [ ] Acciones sensibles ocultas según rol (usar `currentUser.roles`)
- [ ] Botones de editar/eliminar/cerrar sesión visibles solo para roles autorizados
- [ ] Docente ve solo sus propios paralelos/materias en asistencia y calificaciones

---

## Bloque 14 — Verificación y entregables

- [ ] Frontend compila sin errores (`npm run build`)
- [ ] CRUD de aulas funcional con validaciones
- [ ] Gestión de horarios funcional, error 409 manejado con mensaje descriptivo
- [ ] Apertura, registro y cierre de sesión de asistencia funcional
- [ ] Consulta de asistencia funcional con filtros
- [ ] CRUD de tipos de evaluación y evaluaciones funcional
- [ ] Carga y edición de calificaciones funcional
- [ ] Historial académico del estudiante carga y muestra datos correctamente
- [ ] Menú dinámico actualizado con nuevas secciones por rol
- [ ] Integración backend-frontend estable para todos los endpoints nuevos

---

## Notas técnicas

- Roles del Sprint 2 (sin cambios en la lista de roles):
  - `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`
- La aplicación móvil Flutter se mantiene separada; este checklist cubre solo la plataforma web.
- Para las tablas de notas con muchos estudiantes, considerar paginación o scroll virtual.
- El historial académico puede ser costoso en BD; si se vuelve lento, agregar caché o índices adicionales.
