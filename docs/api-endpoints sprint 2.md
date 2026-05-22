# API Endpoints — SI2 Grupo 2 · Sprint 2

> Base URL: `https://s7hwsnmsxf.us-east-1.awsapprunner.com`  
> Todos los endpoints requieren `Authorization: Bearer <token>`  
> Todas las respuestas usan el wrapper `ApiResponse<T>`:
> ```json
> { "codigo": 200, "mensaje": "...", "data": { ... } }
> ```

---

## Aulas

### `POST /api/aulas`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:**
```json
{
  "codigo": "S-101",
  "nombre": "Salón 101",
  "tipoAula": "SALON",
  "capacidad": 35,
  "ubicacion": "Edificio A, Piso 1"
}
```
> `tipoAula`: `SALON | LABORATORIO | TALLER | AUDITORIO | OTRO`

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Aula registrada exitosamente",
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "codigo": "S-101",
    "nombre": "Salón 101",
    "tipoAula": "SALON",
    "capacidad": 35,
    "ubicacion": "Edificio A, Piso 1",
    "estado": "ACTIVO",
    "creadoEn": "2026-05-22T00:00:00Z"
  }
}
```
**Errores:** `409` código de aula ya existe en la institución

---

### `GET /api/aulas`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params (opcionales):**
- `?estado=ACTIVO` — filtrar por estado

**Response 200:** `data` es array de `AulaResponse`

---

### `GET /api/aulas/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `AulaResponse`

---

### `PUT /api/aulas/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:** igual a `POST /api/aulas`

**Response 200:** `data` es `AulaResponse` actualizado

---

### `DELETE /api/aulas/{id}`
Desactiva el aula (estado → `INACTIVO`). No elimina físicamente.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Response 200:** `data: null`

---

## Horarios

### `POST /api/horarios`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:**
```json
{
  "idGestionAcademica": "uuid",
  "idParalelo": "uuid",
  "idMateria": "uuid",
  "idDocente": "uuid",
  "idAula": "uuid",
  "diaSemana": "LUNES",
  "horaInicio": "08:00",
  "horaFin": "09:00",
  "tipoHorario": "REGULAR"
}
```
> `diaSemana`: `LUNES | MARTES | MIERCOLES | JUEVES | VIERNES | SABADO`  
> `tipoHorario`: `REGULAR | RECUPERACION | ESPECIAL` (default: `REGULAR`)  
> `idAula` es opcional

**Response 201:** `data` es `HorarioResponse`

**Errores:** `409` conflicto de horario — el mensaje describe el tipo:
```json
{
  "codigo": 409,
  "mensaje": "Conflicto de horario: el docente ya tiene una clase asignada el LUNES de 08:00 a 09:00",
  "data": null
}
```

---

### `GET /api/horarios`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params (opcionales):**
- `?idGestion=uuid`
- `?idParalelo=uuid`
- `?idDocente=uuid`
- `?idAula=uuid`
- `?diaSemana=LUNES`

**Response 200:** `data` es array de `HorarioResponse`

---

### `GET /api/horarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `HorarioResponse`

---

### `PUT /api/horarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:** igual a `POST /api/horarios`

**Response 200:** `data` es `HorarioResponse` actualizado  
**Errores:** `409` conflicto (excluyendo el propio horario que se actualiza)

---

### `DELETE /api/horarios/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Response 200:** `data: null`

---

## Sesiones de asistencia

### `POST /api/sesiones-asistencia`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
{
  "idGestionAcademica": "uuid",
  "idParalelo": "uuid",
  "idMateria": "uuid",
  "idDocente": "uuid",
  "idHorario": "uuid",
  "fecha": "2026-05-22",
  "horaInicio": "08:00",
  "horaFin": "09:00",
  "observacion": "Clase regular"
}
```
> `idHorario`, `horaFin`, `observacion` son opcionales

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Sesión de asistencia abierta",
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idParalelo": "uuid",
    "idMateria": "uuid",
    "idDocente": "uuid",
    "idGestionAcademica": "uuid",
    "fecha": "2026-05-22",
    "horaInicio": "08:00",
    "horaFin": null,
    "estado": "ABIERTA",
    "creadoEn": "2026-05-22T08:00:00Z"
  }
}
```
**Errores:** `409` ya existe una sesión abierta para ese paralelo+materia+fecha

---

### `GET /api/sesiones-asistencia`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params (opcionales):**
- `?idParalelo=uuid`
- `?idMateria=uuid`
- `?idGestion=uuid`
- `?idDocente=uuid`
- `?fecha=2026-05-22`
- `?estado=ABIERTA`

**Response 200:** `data` es array de `SesionAsistenciaResponse`

---

### `GET /api/sesiones-asistencia/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `SesionAsistenciaResponse`

---

### `POST /api/sesiones-asistencia/{id}/cerrar`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body (opcional):**
```json
{
  "horaFin": "09:00",
  "observacion": "Clase finalizada"
}
```

**Response 200:** `data` es `SesionAsistenciaResponse` con `estado: "CERRADA"`

---

## Registros de asistencia

### `POST /api/sesiones-asistencia/{id}/registros`
Carga masiva de asistencia de todos los estudiantes de la sesión.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
[
  {
    "idEstudiante": "uuid",
    "estadoAsistencia": "PRESENTE",
    "observacion": null
  },
  {
    "idEstudiante": "uuid",
    "estadoAsistencia": "AUSENTE",
    "observacion": "Sin justificación"
  }
]
```
> `estadoAsistencia`: `PRESENTE | AUSENTE | TARDE | JUSTIFICADO`  
> Upsert: si ya existe registro para ese estudiante en la sesión, lo actualiza.

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Asistencia registrada para 30 estudiantes",
  "data": null
}
```
**Errores:** `409` la sesión ya está cerrada

---

### `GET /api/sesiones-asistencia/{id}/registros`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es array de `RegistroAsistenciaResponse`

---

### `PUT /api/sesiones-asistencia/{idSesion}/registros/{idEstudiante}`
Actualiza el estado de asistencia de un estudiante específico.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
{
  "estadoAsistencia": "JUSTIFICADO",
  "observacion": "Presentó justificación médica"
}
```

**Response 200:** `data` es `RegistroAsistenciaResponse` actualizado

---

### `GET /api/estudiantes/{id}/asistencia`
Historial de asistencia de un estudiante.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`, `ESTUDIANTE` (solo sus datos)

**Query params (opcionales):**
- `?idGestion=uuid`
- `?idMateria=uuid`
- `?idParalelo=uuid`

**Response 200:**
```json
{
  "codigo": 200,
  "data": {
    "idEstudiante": "uuid",
    "nombreEstudiante": "Ana García",
    "registros": [
      {
        "fecha": "2026-05-22",
        "idMateria": "uuid",
        "nombreMateria": "Matemáticas",
        "estadoAsistencia": "PRESENTE",
        "observacion": null
      }
    ],
    "resumen": {
      "totalSesiones": 20,
      "totalPresentes": 18,
      "totalAusentes": 2,
      "porcentajeAsistencia": 90.0
    }
  }
}
```

---

## Tipos de evaluación

### `POST /api/tipos-evaluacion`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:**
```json
{
  "nombre": "Examen Parcial",
  "descripcion": "Evaluación de mitad de gestión",
  "porcentaje": 30.0
}
```

**Response 201:** `data` es `TipoEvaluacionResponse`  
**Errores:** `409` nombre ya existe en la institución

---

### `GET /api/tipos-evaluacion`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `DOCENTE`

**Response 200:** `data` es array de `TipoEvaluacionResponse`

---

### `GET /api/tipos-evaluacion/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `DOCENTE`

**Response 200:** `data` es `TipoEvaluacionResponse`

---

### `PUT /api/tipos-evaluacion/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`

**Body:** igual a `POST /api/tipos-evaluacion`

**Response 200:** `data` es `TipoEvaluacionResponse` actualizado

---

### `DELETE /api/tipos-evaluacion/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Response 200:** `data: null`

---

## Evaluaciones

### `POST /api/evaluaciones`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
{
  "idGestionAcademica": "uuid",
  "idParalelo": "uuid",
  "idMateria": "uuid",
  "idDocente": "uuid",
  "idTipoEvaluacion": "uuid",
  "nombre": "Primer Parcial",
  "descripcion": "Temas 1-3",
  "fecha": "2026-06-15",
  "notaMaxima": 100
}
```

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Evaluación registrada",
  "data": {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idParalelo": "uuid",
    "idMateria": "uuid",
    "idDocente": "uuid",
    "idTipoEvaluacion": "uuid",
    "idGestionAcademica": "uuid",
    "nombre": "Primer Parcial",
    "descripcion": "Temas 1-3",
    "fecha": "2026-06-15",
    "notaMaxima": 100,
    "estado": "ACTIVA",
    "creadoEn": "2026-05-22T00:00:00Z"
  }
}
```

---

### `GET /api/evaluaciones`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Query params (opcionales):**
- `?idGestion=uuid`
- `?idParalelo=uuid`
- `?idMateria=uuid`
- `?idDocente=uuid`

**Response 200:** `data` es array de `EvaluacionResponse`

---

### `GET /api/evaluaciones/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es `EvaluacionResponse`

---

### `PUT /api/evaluaciones/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:** igual a `POST /api/evaluaciones`

**Response 200:** `data` es `EvaluacionResponse` actualizado

---

### `DELETE /api/evaluaciones/{id}`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`

**Response 200:** `data: null`

---

### `POST /api/evaluaciones/{id}/cerrar`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Response 200:** `data` es `EvaluacionResponse` con `estado: "CERRADA"`

---

## Calificaciones

### `POST /api/evaluaciones/{id}/calificaciones`
Carga masiva de notas para la evaluación.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
[
  {
    "idEstudiante": "uuid",
    "nota": 85.5,
    "observacion": null
  },
  {
    "idEstudiante": "uuid",
    "nota": 72.0,
    "observacion": "Entregó tarde"
  }
]
```
> Upsert: si ya existe calificación para ese estudiante en esa evaluación, la actualiza.  
> Valida: `nota >= 0` y `nota <= notaMaxima` de la evaluación.

**Response 201:**
```json
{
  "codigo": 201,
  "mensaje": "Calificaciones registradas para 28 estudiantes",
  "data": null
}
```
**Errores:** `409` la evaluación está en estado CERRADA o ANULADA  
**Errores:** `400` nota fuera del rango permitido

---

### `GET /api/evaluaciones/{id}/calificaciones`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`

**Response 200:** `data` es array de `RegistroCalificacionResponse`
```json
[
  {
    "id": "uuid",
    "idInstitucion": "uuid",
    "idEvaluacion": "uuid",
    "idEstudiante": "uuid",
    "nombreEstudiante": "Ana García",
    "nota": 85.5,
    "observacion": null,
    "estado": "REGISTRADA",
    "creadoEn": "2026-05-22T00:00:00Z"
  }
]
```

---

### `PUT /api/evaluaciones/{idEval}/calificaciones/{idEstudiante}`
Actualiza la nota de un estudiante específico.

**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DOCENTE`

**Body:**
```json
{
  "nota": 90.0,
  "observacion": "Corrección posterior a revisión"
}
```

**Response 200:** `data` es `RegistroCalificacionResponse` actualizado  
**Errores:** `409` la calificación está anulada o la evaluación está cerrada  
**Errores:** `400` nota fuera del rango permitido

---

## Historial académico del estudiante

### `GET /api/estudiantes/{id}/historial`
**Roles:** `SUPER_ADMIN`, `ADMIN_INSTITUCION`, `DIRECTOR`, `SECRETARIO`, `DOCENTE`, `ESTUDIANTE` (solo sus datos)

**Query params (opcionales):**
- `?idGestion=uuid` — si se omite, devuelve todas las gestiones

**Response 200:**
```json
{
  "codigo": 200,
  "data": {
    "idEstudiante": "uuid",
    "codigoEstudiante": "EST-2026-001",
    "nombreCompleto": "Ana García López",
    "gestiones": [
      {
        "idGestion": "uuid",
        "nombreGestion": "Gestión 2026",
        "idParalelo": "uuid",
        "nombreParalelo": "1ro A",
        "estadoInscripcion": "ACTIVA",
        "materias": [
          {
            "idMateria": "uuid",
            "nombreMateria": "Matemáticas",
            "evaluaciones": [
              {
                "idEvaluacion": "uuid",
                "nombreEvaluacion": "Primer Parcial",
                "tipoEvaluacion": "Examen Parcial",
                "fecha": "2026-06-15",
                "notaMaxima": 100,
                "nota": 85.5,
                "estado": "REGISTRADA"
              }
            ],
            "promedioMateria": 85.5,
            "asistencia": {
              "totalSesiones": 20,
              "sesionesAsistidas": 18,
              "porcentajeAsistencia": 90.0
            }
          }
        ],
        "promedioGeneral": 85.5
      }
    ]
  }
}
```
