import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '@/core/models/api-response.model';
import {
    CalificacionAsignacionResponse,
    CalificacionPlantillaResponse,
    CalificacionRegistroRequest,
    CalificacionResumenResponse,
    EvaluacionRequest,
    EvaluacionResponse,
} from '@/core/models/sia.models';

/**
 * ====================================================================
 * SERVICIO: CalificacionService (Angular)
 * ====================================================================
 * 
 * Servicio de comunicación HTTP con el backend para todas las
 * operaciones relacionadas con evaluaciones y calificaciones.
 * 
 * RESPONSABILIDADES:
 * 1. Hacer llamadas HTTP al endpoint /api/calificaciones
 * 2. Construir parámetros de query (QueryParams)
 * 3. Mapear DTOs entre frontend y backend
 * 4. Retornar Observables para que el componente se suscriba
 * 
 * PATRONES USADOS:
 * - Inyección de dependencias: HttpClient y environment
 * - Observable pattern: RxJS para manejo asincrónico
 * - Parámetros de query: Para filtros (id, periodo)
 * - ApiResponse<T>: Wrapper estandarizado
 * 
 * MÉTODOS:
 * - listarMisAsignaciones: GET asignaciones disponibles
 * - listarEvaluaciones: GET evaluaciones de asignación+periodo
 * - crearEvaluacion: POST nueva evaluación
 * - actualizarEvaluacion: PUT evaluación existente
 * - obtenerPlantilla: GET plantilla de calificaciones
 * - guardarCalificaciones: POST notas de estudiantes
 * - obtenerResumen: GET consolidado de notas
 */
@Injectable({ providedIn: 'root' })
export class CalificacionService {
    private http = inject(HttpClient);
    private base = environment.api.baseUrl;

    /**
     * Obtiene las asignaciones docentes donde se pueden registrar calificaciones.
     * 
     * ENDPOINT: GET /api/calificaciones/mis-asignaciones
     * 
     * FLUJO:
     * 1. Llamada HTTP GET sin parámetros
     * 2. Backend filtra por usuario autenticado
     * 3. Si docente: solo sus asignaciones
     * 4. Si admin: todas las asignaciones
     * 
     * RESPUESTA ESPERADA:
     * {
     *   codigo: 200,
     *   mensaje: "Asignaciones disponibles",
     *   data: [
     *     {
     *       idAsignacionDocente: UUID,
     *       nombreMateria: "Matemáticas",
     *       nombreCurso: "1ro Básico",
     *       nombreParalelo: "A",
     *       nombreDocente: "Juan Pérez",
     *       ...
     *     }
     *   ]
     * }
     * 
     * @return Observable de array de asignaciones
     */
    listarMisAsignaciones(): Observable<ApiResponse<CalificacionAsignacionResponse[]>> {
        return this.http.get<ApiResponse<CalificacionAsignacionResponse[]>>(
            `${this.base}/calificaciones/mis-asignaciones`
        );
    }

    /**
     * Obtiene las evaluaciones de una materia específica.
     * 
     * ENDPOINT: GET /api/calificaciones/evaluaciones
     * 
     * PARÁMETROS:
     * - idMateria: UUID obligatoria
     * - periodo: Opcional (1-6). Si no viene, lista todas
     * 
     * FLUJO:
     * 1. Construye HttpParams con los parámetros
     * 2. Llama GET con params
     * 3. Backend filtra evaluaciones por materia+periodo
     * 4. Ordena por período y nombre
     * 
     * RESPUESTA:
     * {
     *   codigo: 200,
     *   data: [
     *     {
     *       id: UUID,
     *       nombre: "Parcial 1",
     *       tipo: "PARCIAL",
     *       ponderacion: 20,
     *       escala: "NUMERICA",
     *       estado: "ABIERTA",
     *       periodo: 1,
     *       ...
     *     }
     *   ]
     * }
     * 
     * @param idMateria UUID de la materia
     * @param periodo Período opcional (1-6)
     * @return Observable de array de evaluaciones
     */
    listarEvaluacionesPorMateria(idMateria: string, periodo?: number): Observable<ApiResponse<EvaluacionResponse[]>> {
        let params = new HttpParams().set('idMateria', idMateria);
        if (periodo) {
            params = params.set('periodo', periodo);
        }
        return this.http.get<ApiResponse<EvaluacionResponse[]>>(
            `${this.base}/calificaciones/evaluaciones`,
            { params }
        );
    }

    /** @deprecated Usar listarEvaluacionesPorMateria en su lugar */
    listarEvaluaciones(idAsignacionDocente: string, periodo?: number): Observable<ApiResponse<EvaluacionResponse[]>> {
        let params = new HttpParams().set('idAsignacionDocente', idAsignacionDocente);
        if (periodo) {
            params = params.set('periodo', periodo);
        }
        return this.http.get<ApiResponse<EvaluacionResponse[]>>(
            `${this.base}/calificaciones/evaluaciones`,
            { params }
        );
    }

    /**
     * Crea una nueva evaluación en una asignación.
     * 
     * ENDPOINT: POST /api/calificaciones/evaluaciones
     * 
     * BODY ESPERADO:
     * {
     *   idAsignacionDocente: UUID,
     *   periodo: 1-6,
     *   tipo: "PARCIAL|EXAMEN|TRABAJO_PRACTICO|PROYECTO|PARTICIPACION",
     *   nombre: "Parcial 1",
     *   ponderacion: 20.00,
     *   escala: "NUMERICA|LITERAL",
     *   estado: "ABIERTA|CERRADA|ANULADA"
     * }
     * 
     * VALIDACIONES BACKEND:
     * - Ponderación total no supere 100%
     * - No exista otra evaluación con ese nombre
     * - Período válido
     * 
     * RESPUESTA: EvaluacionResponse con ID generado
     * 
     * @param body Datos de la evaluación a crear
     * @return Observable con evaluación creada
     */
    crearEvaluacion(body: EvaluacionRequest): Observable<ApiResponse<EvaluacionResponse>> {
        return this.http.post<ApiResponse<EvaluacionResponse>>(
            `${this.base}/calificaciones/evaluaciones`,
            body
        );
    }

    /**
     * Actualiza una evaluación existente.
     * 
     * ENDPOINT: PUT /api/calificaciones/evaluaciones/{id}
     * 
     * PARÁMETRO PATH:
     * - id: UUID de la evaluación a actualizar
     * 
     * BODY: Mismo que crearEvaluacion
     * 
     * RESTRICCIONES:
     * - Si está CERRADA: solo SUPER_ADMIN/ADMIN_INSTITUCION
     * - Ponderación total no supere 100%
     * 
     * @param id UUID de la evaluación
     * @param body Nuevos datos
     * @return Observable con evaluación actualizada
     */
    actualizarEvaluacion(id: string, body: EvaluacionRequest): Observable<ApiResponse<EvaluacionResponse>> {
        return this.http.put<ApiResponse<EvaluacionResponse>>(
            `${this.base}/calificaciones/evaluaciones/${id}`,
            body
        );
    }

    /**
     * Obtiene la plantilla de calificaciones para una evaluación.
     * 
     * ENDPOINT: GET /api/calificaciones/plantilla
     * 
     * PARÁMETRO:
     * - idEvaluacion: UUID de la evaluación
     * 
     * PLANTILLA INCLUYE:
     * - idEvaluacion: UUID
     * - evaluacion: Info de la evaluación (tipo, ponderación, escala)
     * - asignacion: Info de docente/materia/paralelo
     * - estudiantes: Array con datos de cada estudiante
     *   * idInscripcion: Para asociar la nota
     *   * codigoEstudiante: CI o código
     *   * nombreCompleto: Nombre completo del estudiante
     *   * notaNumerica/notaLiteral: Nota ya registrada (si existe)
     *   * registrado: boolean indicador
     * - escalaMaxima: 100 o valor según institución
     * - puedeEditar: boolean (si evaluación está ABIERTA)
     * 
     * USO FRONTEND:
     * - Poblar tabla HTML con estudiantes
     * - Campos de input para ingresar notas
     * - Indicar cuales ya tienen nota registrada
     * 
     * @param idEvaluacion UUID de la evaluación
     * @return Observable con plantilla de calificaciones
     */
    obtenerPlantilla(idEvaluacion: string): Observable<ApiResponse<CalificacionPlantillaResponse>> {
        const params = new HttpParams().set('idEvaluacion', idEvaluacion);
        return this.http.get<ApiResponse<CalificacionPlantillaResponse>>(
            `${this.base}/calificaciones/plantilla`,
            { params }
        );
    }

    /**
     * Guarda/actualiza calificaciones de múltiples estudiantes.
     * 
     * ENDPOINT: POST /api/calificaciones
     * 
     * BODY ESPERADO:
     * {
     *   idEvaluacion: UUID,
     *   detalles: [
     *     {
     *       idInscripcion: UUID,
     *       notaNumerica: 85.50 || null,
     *       notaLiteral: "A" || null,
     *       razonCambio: "Se corrigió calificación anterior" || null
     *     },
     *     ...
     *   ]
     * }
     * 
     * VALIDACIONES BACKEND:
     * - notaNumerica si escala es NUMERICA
     * - notaLiteral si escala es LITERAL
     * - Nota dentro de rango (0-100)
     * - Nota literal válida (A-F)
     * - razonCambio obligatorio si modifica nota previa
     * - Evaluación debe estar ABIERTA
     * 
     * EFECTOS:
     * - Crea nuevas calificaciones
     * - Actualiza calificaciones existentes
     * - Registra cambios en tabla CalificacionCambio (auditoría)
     * - Registra operación en Auditoria
     * 
     * RESPUESTA: CalificacionPlantillaResponse actualizada
     * 
     * @param body Evaluación + detalles de calificaciones
     * @return Observable con plantilla actualizada
     */
    guardarCalificaciones(body: CalificacionRegistroRequest): Observable<ApiResponse<CalificacionPlantillaResponse>> {
        return this.http.post<ApiResponse<CalificacionPlantillaResponse>>(
            `${this.base}/calificaciones`,
            body
        );
    }

    /**
     * Obtiene el resumen consolidado de calificaciones.
     * 
     * ENDPOINT: GET /api/calificaciones/resumen
     * 
     * PARÁMETROS:
     * - idAsignacionDocente: UUID obligatoria
     * - periodo: 1-6 obligatorio
     * 
     * RESUMEN INCLUYE:
     * - evaluaciones: Array de evaluaciones no anuladas del período
     * - ponderacionTotal: Suma de ponderaciones
     * - notaMinimaAprobacion: Configurada por institución
     * - estudiantes: Array con:
     *   * codigoEstudiante: Para identificar
     *   * nombreCompleto: Nombre del estudiante
     *   * notaConsolidada: Σ(nota × ponderación/100)
     *   * ponderacionRegistrada: % de ponderación que tiene notas
     *   * estadoAcademico: "APROBADO" o "EN_RIESGO"
     * 
     * CÁLCULO DE NOTA CONSOLIDADA:
     * - Suma todas las notas numéricas multiplicadas por ponderación
     * - Divide por ponderación total
     * - Solo cuenta evaluaciones no anuladas
     * - Notas literales se ignoran en cálculo
     * 
     * ESTADO ACADÉMICO:
     * - APROBADO: notaConsolidada >= notaMinimaAprobacion
     * - EN_RIESGO: notaConsolidada < notaMinimaAprobacion
     * 
     * UTILIDAD:
     * - Reporte de desempeño
     * - Identificar estudiantes en riesgo
     * - Verificar completitud de calificaciones
     * 
     * @param idAsignacionDocente UUID de la asignación
     * @param periodo Período (1-6)
     * @return Observable con resumen de calificaciones
     */
    obtenerResumen(idAsignacionDocente: string, periodo: number): Observable<ApiResponse<CalificacionResumenResponse>> {
        const params = new HttpParams()
            .set('idAsignacionDocente', idAsignacionDocente)
            .set('periodo', periodo);
        return this.http.get<ApiResponse<CalificacionResumenResponse>>(
            `${this.base}/calificaciones/resumen`,
            { params }
        );
    }
}
