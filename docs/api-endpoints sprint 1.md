# API Endpoints — SI2 Grupo 2 · Sprint 1

> Base URL: `https://s7hwsnmsxf.us-east-1.awsapprunner.com`  
> Todos los endpoints (excepto auth) requieren `Authorization: Bearer <token>`  
> Todas las respuestas tienen el wrapper `ApiResponse<T>`:
> ```json
> { "codigo": 200, "mensaje": "...", "data": { ... } }
> ```

---

## Autenticación

### `POST /api/auth/login`
**Roles:** Público

**Body:**
```json
{
  "correo": "admin@institucion.edu.bo",
  "contrasena": "Admin123!"
}
```

**Response 200:**
```json
{
  "codigo": 200,
  "mensaje": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "correo": "admin@institucion.edu.bo",
    "roles": ["ADMIN_INSTITUCION"],
    "requiereCambioContrasena": false
  }
}
```

**Errores:** `401` credenciales incorrectas

---

### `POST /api/auth/register`
**Roles:** Público

> ⚠️ **Solo para** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR` y `SECRETARIO`.  
> Los **docentes, estudiantes y tutores** tienen su propia cuenta creada automáticamente al registrarlos en sus respectivos endpoints.

**Body:**
```json
{
  "correo": "nuevo@institucion.edu.bo",
  "contrasena": "Segura123!",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "idInstitucion": "uuid-de-la-institucion",
  "codigoRol": "ADMIN_INSTITUCION"
}
```
> `codigoRol` es opcional. Default: `ADMIN_INSTITUCION`.  
> `idInstitucion` es opcional para `SUPER_ADMIN`.

**Response 200:**
```json
{
  "codigo": 200,
  "mensaje": "Registro exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "correo": "nuevo@institucion.edu.bo",
    "roles": ["ADMIN_INSTITUCION"],
    "requiereCambioContrasena": false
  }
}
```

**Errores:** `409` correo ya registrado

---

## Instituciones

### `POST /api/instituciones`
**Roles:** `SUPER_ADMIN`

**Body:**
```json
{
  "codigo": "COL-001",
  "nombre": "Colegio San Juan",
  "tipoInstitucion": "PRIVADO",
  "telefono": "70012345",
  "correo": "info@sanjuan.edu.bo",
  "direccion": "Av. Principal 123",
  "logoUrl": "https://..."
}
```
> `tipoInstitucion`: `FISCAL | CONVENIO | PRIVADO`

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Institución creada",
  "data": {
    "id": "uuid",
    "codigo": "COL-001",
    "nombre": "Colegio San Juan",
    "tipoInstitucion": "PRIVADO",
    "telefono": "70012345",
    "correo": "info@sanjuan.edu.bo",
    "direccion": "Av. Principal 123",
    "logoUrl": "https://...",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/instituciones`
**Roles:** `SUPER_ADMIN`

**Response 200:** `data` es array de `InstitucionResponse`

---

### `GET /api/instituciones/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `InstitucionResponse`

---

### `PUT /api/instituciones/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Body:** igual a `POST /api/instituciones`

**Response 200:** `data` es `InstitucionResponse` actualizado

---

### `GET /api/instituciones/{id}/configuraciones`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "idInstitucion": "uuid",
      "clave": "LOGO_URL",
      "valor": "https://...",
      "tipoValor": "TEXTO",
      "descripcion": "URL del logo"
    }
  ]
}
```

---

### `PUT /api/instituciones/{id}/configuraciones`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Body:**
```json
{
  "clave": "LOGO_URL",
  "valor": "https://nuevo-logo.png",
  "tipoValor": "TEXTO",
  "descripcion": "URL del logo institucional"
}
```
> `tipoValor`: `TEXTO | NUMERO | BOOLEANO | JSON`

**Response 200:** `data` es `ConfiguracionInstitucionResponse`

---

## Usuarios

### `GET /api/usuarios`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`,`DOCENTE`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "idInstitucion": "uuid",
      "correo": "usuario@inst.edu.bo",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "telefono": "70012345",
      "estado": "ACTIVO",
      "roles": ["SECRETARIO"],
      "ultimoAcceso": "2026-04-22T10:00:00Z",
      "creadoEn": "2026-01-01T00:00:00Z",
      "actualizadoEn": "2026-04-22T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/usuarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Response 200:** `data` es `UsuarioResponse`

---

### `PUT /api/usuarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Body:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "telefono": "70099999"
}
```

**Response 200:** `data` es `UsuarioResponse` actualizado

---

### `DELETE /api/usuarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Response 200:** `data` es `UsuarioResponse` con `estado: "INACTIVO"`

---

### `POST /api/usuarios/{id}/roles`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Body:**
```json
{
  "codigoRol": "SECRETARIO"
}
```
> Roles disponibles: `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`, `ESTUDIANTE`, `TUTOR`

**Response 200:** `data` es `UsuarioResponse` con roles actualizados

---

## Gestión Académica

### `POST /api/gestiones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Body:**
```json
{
  "nombre": "Gestión 2026",
  "fechaInicio": "2026-02-01",
  "fechaFin": "2026-11-30",
  "activa": true
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "nombre": "Gestión 2026",
    "fechaInicio": "2026-02-01",
    "fechaFin": "2026-11-30",
    "activa": true,
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

**Errores:** `409` ya existe una gestión activa

---

### `GET /api/gestiones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es array de `GestionAcademicaResponse`

---

### `GET /api/gestiones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `GestionAcademicaResponse`

---

### `PUT /api/gestiones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Body:** igual a `POST /api/gestiones`

**Response 200:** `data` es `GestionAcademicaResponse` actualizado

---

### `DELETE /api/gestiones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Cursos

### `POST /api/cursos`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "codigo": "1SEC",
  "nombre": "1ro de Secundaria",
  "nivel": "SECUNDARIA"
}
```

**Response 201:** `data` es `CursoResponse`
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "codigo": "1SEC",
    "nombre": "1ro de Secundaria",
    "nivel": "SECUNDARIA",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/cursos`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es array de `CursoResponse`

---

### `GET /api/cursos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `CursoResponse`

---

### `PUT /api/cursos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:** igual a `POST /api/cursos`

**Response 200:** `data` es `CursoResponse` actualizado

---

### `DELETE /api/cursos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

### `POST /api/cursos/{id}/materias`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "idMateria": "uuid-de-la-materia"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idCurso": "uuid",
    "idMateria": "uuid",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z"
  }
}
```

**Errores:** `409` materia ya asignada al curso

---

### `DELETE /api/cursos/{id}/materias/{idMateria}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Paralelos

### `POST /api/paralelos`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "idCurso": "uuid-del-curso",
  "idGestion": "uuid-de-la-gestion",
  "nombre": "A",
  "capacidad": 30
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idCurso": "uuid",
    "idGestion": "uuid",
    "nombre": "A",
    "capacidad": 30,
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/paralelos`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params:** `?idCurso=uuid` (opcional — filtrar por curso)

**Response 200:** `data` es array de `ParaleloResponse`

---

### `GET /api/paralelos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `ParaleloResponse`

---

### `PUT /api/paralelos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:** igual a `POST /api/paralelos`

**Response 200:** `data` es `ParaleloResponse` actualizado

---

### `DELETE /api/paralelos/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Materias

### `POST /api/materias`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "codigo": "MAT-001",
  "nombre": "Matemáticas",
  "area": "Álgebra y geometría",
  "cargaHoraria": 5
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "codigo": "MAT-001",
    "nombre": "Matemáticas",
    "area": "Álgebra y geometría",
    "cargaHoraria": 5,
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/materias`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es array de `MateriaResponse`

---

### `GET /api/materias/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `MateriaResponse`

---

### `PUT /api/materias/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:** igual a `POST /api/materias`

**Response 200:** `data` es `MateriaResponse` actualizado

---

### `DELETE /api/materias/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Docentes

### `POST /api/docentes`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "codigo": "DOC-001",
  "documentoIdentidad": "1234567",
  "nombres": "Carlos",
  "apellidos": "Mamani",
  "telefono": "70011111",
  "correo": "carlos@inst.edu.bo",
  "especialidad": "Matemáticas"
}
```
> `documentoIdentidad` y `correo` son obligatorios.  
> Se crea automáticamente una cuenta de usuario con rol `DOCENTE`. La contraseña inicial es el valor de `documentoIdentidad` (`requiereCambioContrasena: false`).

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idUsuario": "uuid-auto-asignado",
    "codigo": "DOC-001",
    "documentoIdentidad": "1234567",
    "nombres": "Carlos",
    "apellidos": "Mamani",
    "telefono": "70011111",
    "correo": "carlos@inst.edu.bo",
    "especialidad": "Matemáticas",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/docentes`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es array de `DocenteResponse`

---

### `GET /api/docentes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `DocenteResponse`

---

### `PUT /api/docentes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:** igual a `POST /api/docentes`

**Response 200:** `data` es `DocenteResponse` actualizado

---

### `DELETE /api/docentes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Estudiantes

### `POST /api/estudiantes`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Body:**
```json
{
  "codigoEstudiante": "EST-2026-001",
  "documentoIdentidad": "7654321",
  "nombres": "Ana",
  "apellidos": "Quispe",
  "fechaNacimiento": "2010-05-15",
  "sexo": "F",
  "direccion": "Calle 1 #123",
  "telefono": "70022222",
  "correo": "ana@email.com"
}
```
> `documentoIdentidad`, `correo` y `codigoEstudiante` son obligatorios.  
> `sexo`: `M | F | O`  
> Se crea automáticamente una cuenta de usuario con rol `ESTUDIANTE`. La contraseña inicial es el valor de `documentoIdentidad` (`requiereCambioContrasena: false`).

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idUsuario": "uuid-auto-asignado",
    "codigoEstudiante": "EST-2026-001",
    "documentoIdentidad": "7654321",
    "nombres": "Ana",
    "apellidos": "Quispe",
    "fechaNacimiento": "2010-05-15",
    "sexo": "F",
    "direccion": "Calle 1 #123",
    "telefono": "70022222",
    "correo": "ana@email.com",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/estudiantes`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es array de `EstudianteResponse`

---

### `GET /api/estudiantes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `EstudianteResponse`

---

### `PUT /api/estudiantes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Body:** igual a `POST /api/estudiantes`

**Response 200:** `data` es `EstudianteResponse` actualizado

---

### `DELETE /api/estudiantes/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

## Tutores

### `POST /api/tutores`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Body:**
```json
{
  "documentoIdentidad": "9876543",
  "nombres": "Rosa",
  "apellidos": "López",
  "telefono": "70033333",
  "correo": "rosa@email.com",
  "direccion": "Calle 1 #123"
}
```
> `documentoIdentidad` y `correo` son obligatorios.  
> Se crea automáticamente una cuenta de usuario con rol `TUTOR`. La contraseña inicial es el valor de `documentoIdentidad` (`requiereCambioContrasena: false`).

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idUsuario": "uuid-auto-asignado",
    "documentoIdentidad": "9876543",
    "nombres": "Rosa",
    "apellidos": "López",
    "telefono": "70033333",
    "correo": "rosa@email.com",
    "direccion": "Calle 1 #123",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z",
    "actualizadoEn": "2026-04-22T10:00:00Z"
  }
}
```

---

### `GET /api/tutores`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es array de `TutorResponse`

---

### `GET /api/tutores/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `TutorResponse`

---

### `PUT /api/tutores/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Body:** igual a `POST /api/tutores`

**Response 200:** `data` es `TutorResponse` actualizado

---

### `DELETE /api/tutores/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`

**Response 200:** `data: null`

---

### `POST /api/tutores/estudiantes/{idEstudiante}`
Vincula un tutor con un estudiante.

**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `SECRETARIO`

**Body:**
```json
{
  "idTutor": "uuid-del-tutor",
  "parentesco": "MADRE",
  "esPrincipal": true
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idEstudiante": "uuid",
    "idTutor": "uuid",
    "parentesco": "MADRE",
    "esPrincipal": true,
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z"
  }
}
```

**Errores:** `409` ya existe un tutor principal activo para ese estudiante

---

### `GET /api/tutores/estudiantes/{idEstudiante}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es array de `EstudianteTutorResponse`

---

### `DELETE /api/tutores/estudiantes/{idEstudiante}/{idTutor}`
Desvincula un tutor de un estudiante (cambia estado a INACTIVO).

**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `SECRETARIO`

**Response 200:** `data: null`

---

## Inscripciones

### `POST /api/inscripciones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Body:**
```json
{
  "idEstudiante": "uuid",
  "idGestion": "uuid",
  "idCurso": "uuid",
  "idParalelo": "uuid",
  "fechaInscripcion": "2026-04-22"
}
```
> `fechaInscripcion` es opcional — default: fecha actual

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idEstudiante": "uuid",
    "idGestion": "uuid",
    "idCurso": "uuid",
    "idParalelo": "uuid",
    "fechaInscripcion": "2026-04-22",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z"
  }
}
```

**Errores:** `409` el estudiante ya está inscrito activamente en ese paralelo/gestión

---

### `GET /api/inscripciones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Query params** (todos opcionales):
- `?idEstudiante=uuid`
- `?idGestion=uuid`
- `?idParalelo=uuid`

**Response 200:** `data` es array de `InscripcionResponse`

---

### `GET /api/inscripciones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `InscripcionResponse`

---

### `DELETE /api/inscripciones/{id}`
Anula una inscripción (no elimina, cambia estado a ANULADO).

**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `SECRETARIO`

**Response 200:** `data: null`

---

## Asignaciones Docente

### `POST /api/asignaciones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Body:**
```json
{
  "idDocente": "uuid",
  "idMateria": "uuid",
  "idParalelo": "uuid",
  "idGestion": "uuid"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idDocente": "uuid",
    "idMateria": "uuid",
    "idParalelo": "uuid",
    "idGestion": "uuid",
    "estado": "ACTIVO",
    "creadoEn": "2026-04-22T10:00:00Z"
  }
}
```

**Errores:** `409` el docente ya está asignado a esa materia+paralelo+gestión

---

### `GET /api/asignaciones`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Query params** (todos opcionales):
- `?idDocente=uuid`
- `?idGestion=uuid`
- `?idParalelo=uuid`

**Response 200:** `data` es array de `AsignacionDocenteResponse`

---

### `GET /api/asignaciones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`, `SECRETARIO`

**Response 200:** `data` es `AsignacionDocenteResponse`

---

### `DELETE /api/asignaciones/{id}`
**Roles:** `ADMIN_INSTITUCION`, `SUPER_ADMIN`, `DIRECTOR`

**Response 200:** `data: null`

---

## Archivos (S3)

> Todos los endpoints de archivos requieren `Authorization: Bearer <token>`.  
> Los archivos se almacenan en S3 (`sia-archivos`, `us-east-1`). La URL devuelta es la URL pública del objeto en S3.

### `POST /api/archivos/upload`
Sube un archivo a S3, lo registra en BD y lo asocia a una entidad del sistema.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Content-Type:** `multipart/form-data`

**Form-data params:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | `File` | Sí | Archivo a subir |
| `modulo` | `string` | Sí | Módulo propietario (ej: `ESTUDIANTE`, `DOCENTE`, `INSTITUCION`) |
| `entidad` | `string` | Sí | Nombre de la entidad en minúsculas (ej: `estudiante`, `docente`) |
| `idEntidad` | `UUID` | Sí | ID del objeto al que se asocia el archivo |
| `tipoReferencia` | `string` | Sí | Tipo semántico del archivo (ej: `FOTO_PERFIL`, `DOCUMENTO_CI`, `LOGO`) |
| `esPrincipal` | `boolean` | No | Default: `true`. Si es el archivo principal de ese tipo |
| `observacion` | `string` | No | Nota libre |

**Response 200:**
```json
{
  "codigo": 200,
  "mensaje": "Archivo subido y registrado exitosamente",
  "data": {
    "id": "uuid",
    "nombreOriginal": "foto.jpg",
    "mimeType": "image/jpeg",
    "tamanoBytes": 204800,
    "extension": "jpg",
    "categoria": "imagen",
    "visibilidad": "PUBLICO",
    "url": "https://sia-archivos.s3.us-east-1.amazonaws.com/...",
    "modulo": "ESTUDIANTE",
    "entidad": "estudiante",
    "idEntidad": "uuid",
    "tipoReferencia": "FOTO_PERFIL",
    "esPrincipal": true,
    "creadoEn": "2026-04-24T10:00:00Z"
  }
}
```

---

### `GET /api/archivos/entidad`
Lista todos los archivos activos asociados a una entidad.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params** (todos requeridos):
- `?modulo=ESTUDIANTE`
- `?entidad=estudiante`
- `?idEntidad=uuid`

**Response 200:** `data` es array de `ArchivoResponse`

---

### `GET /api/archivos/principal`
Obtiene el archivo principal activo de un tipo para una entidad.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params** (todos requeridos):
- `?modulo=ESTUDIANTE`
- `?entidad=estudiante`
- `?idEntidad=uuid`
- `?tipoReferencia=FOTO_PERFIL`

**Response 200:** `data` es `ArchivoResponse` o `null` si no hay archivo principal

---

### `DELETE /api/archivos/{id}`
Eliminación lógica de un archivo (no lo borra de S3, cambia estado a INACTIVO).

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Response 200:** `data: null`

---

## Errores comunes

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `400` | Bad Request | Validación de campos fallida |
| `401` | Unauthorized | Token ausente, expirado o inválido |
| `403` | Forbidden | Rol sin permiso para el endpoint |
| `404` | Not Found | Recurso no existe o no pertenece a la institución |
| `409` | Conflict | Duplicado (correo, código, inscripción activa, etc.) |
| `500` | Internal Server Error | Error inesperado del servidor |

**Formato de error:**
```json
{
  "codigo": 404,
  "mensaje": "Recurso no encontrado",
  "data": null
}
```

---

## Resumen de endpoints por módulo

| Módulo | Endpoints | Roles mínimos |
|--------|-----------|---------------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` | Público |
| Instituciones | 6 endpoints | `SUPER_ADMIN` / `ADMIN_INSTITUCION` |
| Usuarios | 5 endpoints | `ADMIN_INSTITUCION`+ |
| Gestiones | 5 endpoints | `ADMIN_INSTITUCION`+ |
| Cursos | 6 endpoints (+materias) | `ADMIN_INSTITUCION`+ |
| Paralelos | 5 endpoints | `ADMIN_INSTITUCION`+ |
| Materias | 5 endpoints | `ADMIN_INSTITUCION`+ |
| Docentes | 5 endpoints | `ADMIN_INSTITUCION`+ · crea cuenta `DOCENTE` automáticamente |
| Estudiantes | 5 endpoints | `ADMIN_INSTITUCION`+ · crea cuenta `ESTUDIANTE` automáticamente |
| Tutores | 5 endpoints + 3 vínculos estudiante-tutor | `ADMIN_INSTITUCION`+ · crea cuenta `TUTOR` automáticamente |
| Inscripciones | 4 endpoints | `ADMIN_INSTITUCION`+ |
| Asignaciones | 4 endpoints | `ADMIN_INSTITUCION`+ |
| Archivos (S3) | 4 endpoints | `ADMIN_INSTITUCION`+ |

**Total: ~64 endpoints**
