# Checklist Frontend — SI2 Grupo 2 · Sprint 1

> Stack: Angular 20 · PrimeNG · TypeScript · Angular Router · Reactive Forms · JWT  
> Arquitectura: standalone + feature-based + lazy loading  
> Integración: Backend Spring Boot (`/api/**`)

---

## Historias de usuario Sprint 1

| ID | Historia | SP | Estado |
|----|----------|----|--------|
| HU-S1-01 | Registrar institución educativa | 2 | ✅ Completado |
| HU-S1-02 | Configurar institución educativa | 3 | ✅ Completado |
| HU-S1-03 | Iniciar sesión | 5 | ✅ Completado |
| HU-S1-04 | Gestionar usuarios | 5 | ✅ Completado |
| HU-S1-05 | Asignar roles a usuarios | 3 | ✅ Completado |
| HU-S1-06 | Gestionar gestión académica | 3 | ✅ Completado |
| HU-S1-07 | Gestionar cursos y paralelos | 5 | ✅ Completado |
| HU-S1-08 | Gestionar materias y asignarlas a cursos | 5 | ✅ Completado |
| HU-S1-09 | Gestionar docentes | 5 | ✅ Completado |
| HU-S1-10 | Gestionar estudiantes | 5 | ✅ Completado |
| HU-S1-11 | Gestionar tutores y vincularlos con estudiantes | 5 | ✅ Completado |
| HU-S1-12 | Inscribir estudiante en gestión, curso y paralelo | 5 | ✅ Completado |
| HU-S1-13 | Asignar docente a materia y paralelo | 5 | ✅ Completado |

**Total estimado:** 56 SP · **Completados:** 56 SP ✅

---

## Bloque 1 — Base del proyecto
> Soporta todas las HU

- [x] Crear proyecto Angular base
- [x] Configurar Angular standalone
- [x] Instalar y configurar PrimeNG
- [x] Configurar tema global
- [x] Configurar rutas base (`app.routes.ts`)
- [x] Configurar environments
- [x] Definir estructura por features:
  - [x] `core/`
  - [x] `shared/`
  - [x] `layout/`
  - [x] `features/`

---

## Bloque 2 — Core del sistema
> Soporta todas las HU

- [x] Crear `auth.interceptor`
- [x] Crear `error.interceptor`
- [x] Crear `auth.guard`
- [x] Crear `role.guard`
- [x] Crear `session.service`
- [x] Crear `menu.service`
- [x] Crear interfaces base:
  - [x] `ApiResponse`
  - [x] `AuthResponse`
  - [x] `UsuarioSesion`
- [x] Manejar almacenamiento de JWT
- [x] Recuperar sesión al refrescar la app

---

## Bloque 3 — Layout y navegación
> Soporta todas las HU autenticadas

- [x] Crear `AppLayout`
- [x] Crear sidebar
- [x] Crear topbar
- [x] Crear dashboard inicial
- [x] Mostrar usuario autenticado
- [x] Mostrar rol activo
- [x] Implementar logout
- [x] Construir menú dinámico según rol
- [x] Configurar lazy loading por módulo

---

## Bloque 4 — Autenticación y acceso
> Soporta: HU-S1-03

- [x] Crear pantalla de login
- [x] Crear formulario reactivo de login
- [x] Validar correo y contraseña
- [x] Conectar `POST /api/auth/login`
- [x] Guardar JWT y claims (`roles`, `id_institucion`)
- [x] Redirigir al dashboard después del login
- [x] Mostrar mensajes de error de autenticación
- [x] Manejar 401 y cierre de sesión automática

---

## Bloque 5 — Institución y configuración
> Soporta: HU-S1-01, HU-S1-02

- [x] Crear pantalla de registro de institución
- [x] Crear pantalla de configuración de institución
- [x] Crear formularios reactivos de datos institucionales
- [x] Crear formulario de parámetros académicos (configuraciones clave/valor)
- [x] Conectar endpoints de institución
- [x] Conectar endpoints de configuración institucional
- [x] Validar campos obligatorios
- [x] Mostrar mensajes de éxito y error
- [x] Crear sección de logo institucional separada
- [x] Mostrar logo institucional actual (GET /api/archivos/principal)
- [x] Permitir seleccionar archivo para logo
- [x] Validar formato y tamaño del logo antes de subir
- [x] Subir logo al backend (POST /api/archivos/upload)
- [x] Reemplazar logo institucional actual

---

## Bloque 6 — Usuarios y roles
> Soporta: HU-S1-04, HU-S1-05

- [x] Crear listado de usuarios
- [x] Crear formulario de usuario
- [x] Crear pantalla de edición de usuario
- [x] Crear acción para desactivar usuario
- [x] Crear pantalla/modal para asignación de roles
- [x] Mostrar roles actuales del usuario
- [x] Conectar endpoints de usuarios
- [x] Conectar endpoint de asignación de roles
- [x] Manejar error de correo duplicado
- [x] Restringir acciones según rol autenticado

---

## Bloque 7 — Gestión académica
> Soporta: HU-S1-06

- [x] Crear listado de gestiones académicas
- [x] Crear formulario de gestión académica
- [x] Permitir crear gestión
- [x] Permitir editar gestión
- [x] Permitir activar gestión
- [x] Mostrar estado de gestión
- [x] Manejar validación de única gestión activa

---

## Bloque 8 — Cursos, paralelos y materias
> Soporta: HU-S1-07, HU-S1-08

- [x] Crear listado de cursos
- [x] Crear formulario de curso
- [x] Crear listado de paralelos
- [x] Crear formulario de paralelo
- [x] Crear listado de materias
- [x] Crear formulario de materia
- [x] Crear pantalla de asignación materia-curso
- [x] Conectar endpoints de cursos
- [x] Conectar endpoints de paralelos
- [x] Conectar endpoints de materias
- [x] Conectar endpoints de curso-materia
- [x] Mostrar errores por duplicados o inconsistencias

---

## Bloque 9 — Personas académicas
> Soporta: HU-S1-09, HU-S1-10, HU-S1-11

- [x] Crear listado y formulario de docentes
- [x] Crear listado y formulario de estudiantes
- [x] Crear listado y formulario de tutores
- [x] Crear pantalla de vínculo tutor-estudiante
- [x] Permitir marcar tutor principal
- [x] Conectar endpoints de docentes
- [x] Conectar endpoints de estudiantes
- [x] Conectar endpoints de tutores
- [x] Conectar endpoint de relación tutor-estudiante
- [x] Manejar validaciones por documento/correo duplicado

---

## Bloque 10 — Operación académica
> Soporta: HU-S1-12, HU-S1-13

- [x] Crear formulario de inscripción
- [x] Crear listado de inscripciones
- [x] Crear formulario de asignación docente
- [x] Crear listado de asignaciones docentes
- [x] Conectar endpoint de inscripciones
- [x] Conectar endpoint de asignaciones docentes
- [x] Mostrar errores por duplicidad de inscripción
- [x] Mostrar errores por duplicidad de asignación docente

---

## Bloque 11 — UX mínima
> Soporta todas las HU

- [x] Spinner global o por módulo
- [x] Toasts de éxito y error
- [x] Confirmación en acciones críticas
- [x] Estado vacío en tablas
- [x] Mensajes claros de error
- [x] Indicador visual de carga en formularios
- [x] Botones deshabilitados mientras envía request
- [x] Spinner durante subida de archivos
- [x] Vista previa de imagen antes/después de subir
- [x] Error visual si el archivo no cumple formato/tamaño

---

## Bloque 12 — Validaciones frontend
> Soporta todas las HU con formularios

- [x] Validaciones con Reactive Forms
- [x] Validar campos obligatorios
- [x] Validar formato de correo
- [x] Validar longitudes mínimas y máximas
- [x] Mostrar mensajes por campo
- [x] Marcar controles inválidos al enviar formulario

---

## Bloque 13 — Seguridad frontend
> Soporta todas las rutas protegidas

- [x] Proteger rutas autenticadas con `auth.guard`
- [x] Proteger rutas por rol con `role.guard`
- [x] Ocultar menús según rol
- [x] Manejar 403 mostrando acceso denegado
- [x] Limpiar sesión al expirar token
- [x] Evitar acceso a pantallas sin permisos

---

## Bloque 14 — Verificación y entregables
> Criterios de aceptación del Sprint 1

- [x] Frontend compila sin errores
- [x] Login funcional
- [x] Menú dinámico por rol funcional
- [x] Registro/configuración de institución funcional
- [x] CRUD usuarios funcional
- [x] Asignación de roles funcional
- [x] CRUD gestión académica funcional
- [x] CRUD cursos/paralelos/materias funcional
- [x] CRUD docentes/estudiantes/tutores funcional
- [x] Vínculo tutor-estudiante funcional
- [x] Inscripción funcional
- [x] Asignación docente funcional
- [x] Guards e interceptors operativos
- [x] Integración backend-frontend estable
- [x] Subida de logo institucional funcional
- [x] Reemplazo de logo institucional funcional
- [x] Visualización del logo actual en configuración

---

## Bloque 15 — Archivos y almacenamiento
> Soporta logo institucional y fotos de docentes/estudiantes/tutores

- [x] Crear `StorageService` (`core/services/storage.service.ts`)
- [x] Definir interfaz `ArchivoResponse` en `sia.models.ts`
- [x] Crear componente reutilizable `FileUploadComponent` (`shared/components/file-upload/`)
- [x] Permitir seleccionar archivos `png`, `jpg`, `jpeg`, `webp`, `gif`, `pdf`
- [x] Validar tamaño máximo antes de subir
- [x] Validar tipo de archivo permitido
- [x] Mostrar vista previa de imagen antes de subir
- [x] Soportar drag & drop en el componente de subida
- [x] Integrar `POST /api/archivos/upload`
- [x] Integrar `GET /api/archivos/principal`
- [x] Integrar `GET /api/archivos/entidad`
- [x] Integrar `DELETE /api/archivos/{id}` (baja lógica)
- [x] Mostrar logo institucional actual en configuración
- [x] Permitir subir/reemplazar logo institucional
- [x] Mostrar spinner durante la subida
- [x] Mostrar mensajes de éxito/error en la subida
- [x] Foto de perfil en docentes (FOTO_PERFIL)
- [x] Foto de perfil en estudiantes (FOTO_PERFIL)
- [x] Foto de perfil en tutores (FOTO_PERFIL)

---

## Notas técnicas

- Roles del Sprint 1:
  - `SUPER_ADMIN`
  - `ADMIN_INSTITUCION`
  - `DIRECTOR`
  - `SECRETARIO`
  - `DOCENTE`

- La aplicación móvil no entra en este checklist.
- Este checklist cubre solo la plataforma web del Sprint 1.