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

- [x] `AulaRequest`, `AulaResponse`
- [x] `HorarioRequest`, `HorarioResponse`, `HorarioConflictoResponse`
- [x] `SesionAsistenciaRequest`, `SesionAsistenciaResponse`
- [x] `RegistroAsistenciaRequest`, `RegistroAsistenciaResponse`
- [x] `TipoEvaluacionRequest`, `TipoEvaluacionResponse`
- [x] `EvaluacionRequest`, `EvaluacionResponse`
- [x] `RegistroCalificacionRequest`, `RegistroCalificacionResponse`
- [x] `HistorialAcademicoResponse` (DTO agregado: gestión, materias, evaluaciones, notas, asistencia)

---

## Bloque 2 — Endpoints API (core)
> Agregar en `src/app/core/http/http-api.ts` clase `HttpApi`

- [x] `static aulas = 'api/aulas'`
- [x] `static horarios = 'api/horarios'`
- [x] `static sesionesAsistencia = 'api/sesiones-asistencia'`
- [x] `static tiposEvaluacion = 'api/tipos-evaluacion'`
- [x] `static evaluaciones = 'api/evaluaciones'`
- [x] Helpers de subrutas: sesión → registros, evaluación → calificaciones, estudiante → historial/asistencia

---

## Bloque 3 — Servicios (core)
> Pueden ir en `src/app/core/services/sia.service.ts` o en nuevos archivos por dominio

- [x] `AulaService` — CRUD contra `/api/aulas`
- [x] `HorarioService` — CRUD contra `/api/horarios`, manejar respuesta 409 con mensaje de conflicto
- [x] `AsistenciaService`:
  - [x] `abrirSesion()`, `cerrarSesion()`, `listarSesiones(filtros)`
  - [x] `registrarAsistenciaBatch()`, `actualizarRegistro()`, `listarRegistrosSesion()`
  - [x] `getAsistenciaEstudiante(idEstudiante, filtros)`
- [x] `CalificacionService`:
  - [x] CRUD para `TipoEvaluacion`
  - [x] CRUD para `Evaluacion`
  - [x] `registrarCalificacionesBatch()`, `actualizarCalificacion()`
- [x] `HistorialService` — `getHistorial(idEstudiante, idGestion?)`

---

## Bloque 4 — Rutas SIA
> Actualizar `src/app/features/sia/sia.routes.ts`

- [x] Agregar ruta lazy `aulas` → `AulasComponent`
- [x] Agregar ruta lazy `horarios` → `HorariosComponent`
- [x] Agregar rutas lazy `asistencia` → sub-rutas: sesiones / registrar / consultar
- [x] Agregar ruta lazy `tipos-evaluacion` → `TiposEvaluacionComponent`
- [x] Agregar rutas lazy `evaluaciones` → sub-rutas: lista / calificaciones
- [x] Agregar ruta lazy `historial` → `HistorialComponent`

---

## Bloque 5 — Menú dinámico
> Actualizar `src/app/core/services/menu.service.ts`

- [x] Agregar ítem "Aulas" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`
- [x] Agregar ítem "Horarios" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`
- [x] Agregar ítem "Asistencia" en menú para `DOCENTE`, `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`
- [x] Agregar ítem "Calificaciones" en menú para `DOCENTE`, `ADMIN_INSTITUCION`, `SUPER_ADMIN`
- [x] Agregar ítem "Historial" en menú para `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

---

## Bloque 6 — HU-S2-14: Gestión de aulas
> Nuevo feature: `src/app/features/sia/aulas/`

- [x] `aulas.component.ts` + `.html` — listado de aulas en tabla
  - [x] Columnas: código, nombre, tipo, capacidad, ubicación, estado
  - [x] Filtro por estado (ACTIVO/INACTIVO)
  - [x] Botones: Nuevo, Editar, Desactivar (según rol)
- [x] Modal o página de formulario de aula:
  - [x] Campos: código, nombre, tipo_aula (dropdown), capacidad, ubicación
  - [x] Validaciones reactive forms (código obligatorio, capacidad > 0)
  - [x] Crear y editar con el mismo formulario
- [x] Confirmación de desactivación
- [x] Toast de éxito/error
- [x] Estado vacío si no hay aulas

---

## Bloque 7 — HU-S2-15: Gestión de horarios
> Nuevo feature: `src/app/features/sia/horarios/`

- [x] `horarios.component.ts` + `.html` — listado o vista semanal
  - [x] Selector de paralelo y gestión para filtrar
  - [x] Vista de tabla semanal (días como columnas, franjas horarias como filas) o lista plana
  - [x] Mostrar: materia, docente, aula, día, hora inicio-fin por cada horario
- [x] Formulario de horario:
  - [x] Campos: paralelo (dropdown), materia (dropdown), docente (dropdown), aula (dropdown), día de semana, hora inicio, hora fin
  - [x] Dropdowns poblados dinámicamente desde API (filtrados por gestión activa)
- [x] Manejo de error 409 — mostrar mensaje descriptivo del conflicto (docente/aula/paralelo ocupado)
- [x] Confirmación de eliminación
- [x] Toast éxito/error

---

## Bloque 8 — HU-S2-16: Registro de asistencia
> Nuevo feature: `src/app/features/sia/asistencia/` — sub-vista de registro

- [x] `sesiones-asistencia.component.ts` — listado de sesiones con filtros
  - [x] Filtros: paralelo, materia, fecha, estado
  - [x] Columnas: fecha, materia, paralelo, docente, estado (ABIERTA/CERRADA)
  - [x] Botones: Nueva sesión, Ver registros, Cerrar sesión
- [x] Formulario de apertura de sesión:
  - [x] Campos: paralelo, materia, fecha, hora inicio (hora fin opcional)
  - [x] Mostrar error si ya existe sesión abierta para ese paralelo+materia+fecha
- [x] `registrar-asistencia.component.ts` — vista de registro de una sesión abierta
  - [x] Tabla con lista de estudiantes inscritos en el paralelo
  - [x] Selector por fila: PRESENTE / AUSENTE / TARDE / JUSTIFICADO
  - [x] Selección masiva (marcar todos como PRESENTE)
  - [x] Campo observación opcional por registro
  - [x] Botón guardar (carga batch) con spinner
  - [x] Botón "Cerrar sesión" con confirmación (desactiva edición)
- [x] Toast éxito/error en cada operación

---

## Bloque 9 — HU-S2-17: Consulta de asistencia
> Sub-vista dentro de `src/app/features/sia/asistencia/`

- [x] `consulta-asistencia.component.ts` — vista de consulta general
  - [x] Filtros: paralelo, materia, gestión, rango de fechas
  - [x] Tabla de sesiones con estado y cantidad de presentes/ausentes por sesión
- [x] `detalle-sesion.component.ts` — detalle de registros de una sesión (solo lectura)
  - [x] Tabla: estudiante, estado asistencia, observación
- [x] `asistencia-estudiante.component.ts` — historial de asistencia de un estudiante
  - [x] Selector de gestión y materia
  - [x] Tabla por sesión: fecha, estado, observación
  - [x] Resumen: total sesiones, presentes, % asistencia (badge o chip visual)
- [x] Acceso según rol (ocultar botones de edición para rol de solo lectura)

---

## Bloque 10 — HU-S2-18: Gestión de calificaciones
> Nuevos features: `src/app/features/sia/tipos-evaluacion/` y `src/app/features/sia/calificaciones/`

### Tipos de evaluación
- [x] Listado de tipos de evaluación (tabla simple)
- [x] Modal de crear/editar: nombre, descripción, porcentaje
- [x] Desactivar tipo

### Evaluaciones
- [x] `evaluaciones.component.ts` — listado filtrado por paralelo, materia, gestión
  - [x] Columnas: nombre, tipo, fecha, nota máxima, estado
  - [x] Botones: Nueva, Editar, Ver calificaciones, Cerrar evaluación
- [x] Formulario de evaluación:
  - [x] Campos: nombre, paralelo, materia, tipo evaluación, fecha, nota máxima, descripción
  - [x] Dropdowns dinámicos

### Calificaciones
- [x] `calificaciones.component.ts` — vista de carga de notas de una evaluación
  - [x] Tabla: una fila por estudiante inscrito en el paralelo
  - [x] Input de nota por fila (validar 0 ≤ nota ≤ nota_maxima)
  - [x] Campo observación opcional
  - [x] Carga masiva (botón guardar envía batch completo)
  - [x] Edición individual de nota ya registrada
  - [x] Indicador visual: PENDIENTE (gris) / REGISTRADA (verde) / ANULADA (rojo)
- [x] Toast éxito/error por operación

---

## Bloque 11 — HU-S2-19: Historial académico
> Nuevo feature: `src/app/features/sia/historial/`

- [x] `historial.component.ts` — selector de estudiante + selector de gestión
  - [x] Buscador de estudiante (autocomplete o dropdown)
  - [x] Selector de gestión académica (opcional, default: gestión activa)
- [x] Vista de resultado del historial:
  - [x] Encabezado: datos del estudiante (nombre, código, estado)
  - [x] Por cada materia: tabla de evaluaciones con nombre, tipo, fecha, nota obtenida, nota máxima
  - [x] Resumen de asistencia por materia: total sesiones, presentes, % (badge con color según porcentaje)
  - [x] Promedio general calculado en frontend o devuelto por el backend
- [x] Estado vacío si no tiene historial en la gestión seleccionada

---

## Bloque 12 — UX mínima
> Consistente con estándares del Sprint 1

- [x] Spinner global o por componente durante carga
- [x] Toasts de éxito y error en todas las operaciones
- [x] Confirmación en acciones destructivas (cerrar sesión, anular calificación)
- [x] Estado vacío en todas las tablas nuevas
- [x] Botones deshabilitados mientras se procesa el request
- [x] Mensajes de error claros para 409 (conflicto), 403 (sin permiso), 404 (no encontrado)
- [x] Inputs de nota: solo números, rango visible al usuario

---

## Bloque 13 — Seguridad frontend
> Consistente con guards existentes

- [x] Nuevas rutas protegidas con `authGuard`
- [x] Acciones sensibles ocultas según rol (usar `currentUser.roles`)
- [x] Botones de editar/eliminar/cerrar sesión visibles solo para roles autorizados
- [x] Docente ve solo sus propios paralelos/materias en asistencia y calificaciones

---

## Bloque 14 — Verificación y entregables

- [x] Frontend compila sin errores (`npm run build`)
- [x] CRUD de aulas funcional con validaciones
- [x] Gestión de horarios funcional, error 409 manejado con mensaje descriptivo
- [x] Apertura, registro y cierre de sesión de asistencia funcional
- [x] Consulta de asistencia funcional con filtros
- [x] CRUD de tipos de evaluación y evaluaciones funcional
- [x] Carga y edición de calificaciones funcional
- [x] Historial académico del estudiante carga y muestra datos correctamente
- [x] Menú dinámico actualizado con nuevas secciones por rol
- [x] Integración backend-frontend estable para todos los endpoints nuevos

---

## Notas técnicas

- Roles del Sprint 2 (sin cambios en la lista de roles):
  - `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`
- La aplicación móvil Flutter se mantiene separada; este checklist cubre solo la plataforma web.
- Para las tablas de notas con muchos estudiantes, considerar paginación o scroll virtual.
- El historial académico puede ser costoso en BD; si se vuelve lento, agregar caché o índices adicionales.
