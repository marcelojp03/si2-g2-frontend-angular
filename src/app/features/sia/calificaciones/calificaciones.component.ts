import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@/core/services/auth.service';
import { CalificacionService } from '@/core/services/calificacion.service';
import {
    CalificacionAsignacionResponse,
    CalificacionDetalleRequest,
    CalificacionEstudianteResponse,
    CalificacionPlantillaResponse,
    CalificacionResumenResponse,
    EscalaEvaluacion,
    EstadoEvaluacion,
    EvaluacionRequest,
    EvaluacionResponse,
} from '@/core/models/sia.models';

/**
 * ====================================================================
 * COMPONENTE: CalificacionesComponent (Angular Standalone)
 * ====================================================================
 * 
 * Interfaz completa para gestión de evaluaciones y calificaciones.
 * 
 * FUNCIONALIDAD:
 * 1. Seleccionar asignación docente (materia/grupo/paralelo)
 * 2. Crear nuevas evaluaciones con tipo, nombre y ponderación
 * 3. Listar evaluaciones por período
 * 4. Cargar plantilla de estudiantes para registrar notas
 * 5. Registrar notas numéricas (0-100) o literales (A-F)
 * 6. Ver resumen consolidado con estado académico (APROBADO/EN_RIESGO)
 * 
 * ESTADO REACTIVO (Signals):
 * - asignaciones: Matriz de asignaciones disponibles
 * - evaluaciones: Evaluaciones de la asignación seleccionada
 * - plantilla: Estudiantes con campos para ingresar notas
 * - resumen: Consolidado de notas + estado académico
 * 
 * SEGURIDAD:
 * - AuthService: Verifica roles (DOCENTE, ADMIN, etc.)
 * - Calcula permisos para editar notas (puedeEditarNotas())
 * - Solo docentes ven sus asignaciones
 * 
 * VALIDACIONES EN FRONTEND:
 * - Campos requeridos (nombre, tipo, ponderación en evaluación)
 * - Notas dentro de rango (0-100 para numéricas)
 * - Razon de cambio obligatoria si se modifica nota existente
 * - Solo estudiantes inscritos en plantilla
 */
@Component({
    selector: 'app-calificaciones',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        SelectModule,
        TagModule,
        ToastModule,
        TooltipModule,
        DialogModule,
        TextareaModule,
        ConfirmDialogModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './calificaciones.component.html',
})
export class CalificacionesComponent implements OnInit {
    // Inyectables (servicios)
    private calificacionService = inject(CalificacionService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    // ESTADO REACTIVO (Signals)
    /** Array de asignaciones docentes disponibles */
    asignaciones = signal<CalificacionAsignacionResponse[]>([]);
    /** Array de evaluaciones de la asignación seleccionada */
    evaluaciones = signal<EvaluacionResponse[]>([]);
    /** Plantilla con estudiantes para ingresar notas */
    plantilla = signal<CalificacionPlantillaResponse | null>(null);
    /** Resumen consolidado de notas con estado académico */
    resumen = signal<CalificacionResumenResponse | null>(null);

    // FLAGS DE CARGA (loading states)
    loadingAsignaciones = false;       // Consultando asignaciones
    loadingEvaluaciones = false;       // Consultando evaluaciones
    loadingPlantilla = false;          // Consultando plantilla
    guardandoNotas = false;            // Guardando calificaciones
    guardandoEvaluacion = false;       // Creando/actualizando evaluación
    eliminandoEvaluacion = false;      // Eliminando evaluación
    dialogEvaluacion = false;          // Modal de nueva/editar evaluación
    modoEdicion = false;               // true = editando, false = creando
    evaluacionEditandoId = '';         // UUID de la evaluación en edición

    // DATOS DEL FORMULARIO
    idMateria = '';                    // UUID de materia seleccionada
    idEvaluacion = '';                 // UUID de evaluación seleccionada
    periodo = 1;                       // Período actual (1-6)
    razonesCambio: Record<string, string> = {}; // Razón de cambio por estudiante

    // FORMULARIO DE NUEVA EVALUACION
    formEvaluacion: EvaluacionRequest = this.nuevaEvaluacionForm();

    /**
     * Opciones fijas para dropdowns/combos
     * Estos valores no cambian durante la sesión
     */
    readonly tiposEvaluacion = [
        { label: 'Parcial', value: 'PARCIAL' },
        { label: 'Examen', value: 'EXAMEN' },
        { label: 'Trabajo practico', value: 'TRABAJO_PRACTICO' },
        { label: 'Proyecto', value: 'PROYECTO' },
        { label: 'Participacion', value: 'PARTICIPACION' },
    ];

    readonly escalas = [
        { label: 'Numerica', value: 'NUMERICA' as EscalaEvaluacion },
        { label: 'Literal', value: 'LITERAL' as EscalaEvaluacion },
    ];

    readonly estadosEvaluacion = [
        { label: 'Abierta', value: 'ABIERTA' as EstadoEvaluacion },
        { label: 'Cerrada', value: 'CERRADA' as EstadoEvaluacion },
        { label: 'Anulada', value: 'ANULADA' as EstadoEvaluacion },
    ];

    readonly notasLiterales = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' },
        { label: 'F', value: 'F' },
    ];

    /**
     * OPTIONS COMPUTADOS (derived state)
     * Se recalculan automáticamente cuando sus dependencias cambian
     */

    /** Array de períodos (1-6) para dropdown */
    readonly periodosOptions = computed(() =>
        Array.from({ length: 6 }, (_, index) => ({
            label: `Periodo ${index + 1}`,
            value: index + 1,
        }))
    );

    /** Opciones de asignación para dropdown (etiqueta = "Materia - Curso Paralelo") */
    readonly asignacionesOptions = computed(() =>
        this.asignaciones().map((a) => ({
            label: this.asignacionLabel(a),
            value: a.idMateria,
        }))
    );

    /** Opciones de evaluación para dropdown (etiqueta = "Nombre (Ponderación%)") */
    readonly evaluacionesOptions = computed(() =>
        this.evaluaciones().map((e) => ({
            label: `${e.nombre} (${e.ponderacion}%)`,
            value: e.id,
        }))
    );

    /** Ponderación total acumulada (suma de ponderaciones no anuladas) */
    readonly ponderacionTotal = computed(() =>
        this.evaluaciones()
            .filter((e) => e.estado !== 'ANULADA')
            .reduce((total, evaluacion) => total + Number(evaluacion.ponderacion || 0), 0)
    );

    /**
     * CICLO DE VIDA: ngOnInit
     * 
     * Se ejecuta una sola vez cuando el componente se inicializa.
     * Carga las asignaciones disponibles del docente/administrador.
     */
    ngOnInit(): void {
        this.cargarAsignaciones();
    }

    /**
     * OPERACIÓN: Cargar asignaciones disponibles
     * 
     * FLUJO:
     * 1. Llama al backend GET /api/calificaciones/mis-asignaciones
     * 2. Si es docente: obtiene solo sus asignaciones
     * 3. Si es admin: obtiene todas las asignaciones de la institución
     * 4. Muestra loading indicator mientras se consulta
     * 5. Si llega datos: automáticamente selecciona la primera y carga evaluaciones
     * 
     * ERRORES MANEJADOS:
     * - Error de red: Muestra toast con mensaje de error
     * - Respuesta no 200: Muestra mensaje de warning
     */
    cargarAsignaciones(): void {
        this.loadingAsignaciones = true;
        this.calificacionService.listarMisAsignaciones().subscribe({
            next: (response) => {
                this.loadingAsignaciones = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron cargar las asignaciones');
                    return;
                }
                const data = response.data ?? [];
                this.asignaciones.set(data);
                // Auto-selecciona primera asignación (extrae idMateria)
                if (data.length > 0 && !this.idMateria) {
                    this.idMateria = data[0].idMateria;
                    this.cargarEvaluaciones();
                }
            },
            error: (e) => {
                this.loadingAsignaciones = false;
                this.showError(e, 'No se pudieron cargar las asignaciones');
            },
        });
    }

    /**
     * OPERACIÓN: Cargar evaluaciones de materia seleccionada
     * 
     * PRECONDICIONES:
     * - idMateria debe estar establecido
     * - periodo debe ser válido (1-6)
     * 
     * FLUJO:
     * 1. Consulta GET /api/calificaciones/evaluaciones?idMateria=X&periodo=Y
     * 2. Reinicia plantilla y resumen previos
     * 3. Si hay evaluaciones: selecciona la primera automáticamente
     * 4. Carga plantilla de estudiantes para esa evaluación
     * 5. Carga resumen consolidado del período
     * 
     * ÚTIL PARA:
     * - Cambio de materia
     * - Cambio de período académico
     */
    cargarEvaluaciones(): void {
        if (!this.idMateria) {
            this.showWarn('Selecciona una materia');
            return;
        }

        this.loadingEvaluaciones = true;
        this.idEvaluacion = '';        // Reset evaluación seleccionada
        this.plantilla.set(null);      // Limpia plantilla
        this.resumen.set(null);        // Limpia resumen

        this.calificacionService.listarEvaluacionesPorMateria(this.idMateria, this.periodo).subscribe({
            next: (response) => {
                this.loadingEvaluaciones = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron cargar las evaluaciones');
                    return;
                }
                const data = response.data ?? [];
                this.evaluaciones.set(data);
                // Auto-selecciona primera evaluación
                if (data.length > 0) {
                    this.idEvaluacion = data[0].id;
                    this.cargarPlantilla();
                }
                this.cargarResumen();
            },
            error: (e) => {
                this.loadingEvaluaciones = false;
                this.showError(e, 'No se pudieron cargar las evaluaciones');
            },
        });
    }

    /**
     * OPERACIÓN: Cargar plantilla de calificaciones
     * 
     * PRECONDICIONES:
     * - idEvaluacion debe estar establecido
     * 
     * PLANTILLA INCLUYE:
     * - Lista de estudiantes inscritos en el paralelo
     * - Notas ya registradas (si existen)
     * - Campos editables para nuevas notas
     * - Escala (numérrica 0-100 o literal A-F)
     * 
     * UTILIDAD:
     * - Mostrar tabla de estudiantes para ingresar notas
     * - Indicar si nota está registrada o es nueva
     * - Bloquear si evaluación está cerrada
     * 
     * FLUJO:
     * 1. Consulta GET /api/calificaciones/plantilla?idEvaluacion=X
     * 2. Reinicia razonesCambio (para nueva evaluación)
     * 3. Guarda plantilla en signal (reactivo)
     */
    cargarPlantilla(): void {
        if (!this.idEvaluacion) {
            this.showWarn('Selecciona una evaluacion');
            return;
        }

        this.loadingPlantilla = true;
        this.razonesCambio = {};  // Reset razones

        this.calificacionService.obtenerPlantilla(this.idEvaluacion).subscribe({
            next: (response) => {
                this.loadingPlantilla = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo cargar la plantilla');
                    return;
                }
                this.plantilla.set(response.data);
            },
            error: (e) => {
                this.loadingPlantilla = false;
                this.plantilla.set(null);
                this.showError(e, 'No se pudo cargar la plantilla de calificaciones');
            },
        });
    }

    /**
     * OPERACIÓN: Abrir diálogo para crear nueva evaluación
     * 
     * PRECONDICIONES:
     * - idMateria debe estar seleccionado
     * 
     * FLUJO:
     * 1. Reinicia formulario (nuevaEvaluacionForm)
     * 2. Abre modal/diálogo
     * 3. Usuario completa: nombre, tipo, ponderación, escala, estado
     */
    abrirNuevaEvaluacion(): void {
        if (!this.idMateria) {
            this.showWarn('Selecciona una materia');
            return;
        }
        this.modoEdicion = false;
        this.evaluacionEditandoId = '';
        this.formEvaluacion = this.nuevaEvaluacionForm();
        this.dialogEvaluacion = true;
    }

    abrirEditarEvaluacion(evaluacion: EvaluacionResponse): void {
        this.modoEdicion = true;
        this.evaluacionEditandoId = evaluacion.id;
        this.formEvaluacion = {
            idMateria: evaluacion.idMateria ?? this.idMateria,
            periodo: evaluacion.periodo,
            tipo: evaluacion.tipo,
            nombre: evaluacion.nombre,
            ponderacion: Number(evaluacion.ponderacion),
            escala: evaluacion.escala as any,
            estado: evaluacion.estado as any,
        };
        this.dialogEvaluacion = true;
    }

    confirmarEliminarEvaluacion(evaluacion: EvaluacionResponse): void {
        this.confirmationService.confirm({
            message: `¿Eliminar la evaluacion "${evaluacion.nombre}"? Esta acción no se puede deshacer. Si ya tiene calificaciones registradas, cambia su estado a ANULADA.`,
            header: 'Eliminar evaluacion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonProps: { severity: 'danger' },
            accept: () => this.ejecutarEliminarEvaluacion(evaluacion),
        });
    }

    private ejecutarEliminarEvaluacion(evaluacion: EvaluacionResponse): void {
        this.eliminandoEvaluacion = true;
        this.calificacionService.eliminarEvaluacion(evaluacion.id).subscribe({
            next: (response) => {
                this.eliminandoEvaluacion = false;
                if (response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo eliminar la evaluacion');
                    return;
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Evaluacion eliminada',
                    detail: `"${evaluacion.nombre}" fue eliminada correctamente`,
                    life: 3000,
                });
                if (this.idEvaluacion === evaluacion.id) {
                    this.idEvaluacion = '';
                    this.plantilla.set(null);
                }
                this.cargarEvaluaciones();
            },
            error: (e) => {
                this.eliminandoEvaluacion = false;
                this.showError(e, 'No se pudo eliminar la evaluacion');
            },
        });
    }

    /**
     * OPERACIÓN: Guardar nueva evaluación
     * 
     * VALIDACIONES FRONTEND:
     * - nombre: Obligatorio
     * - tipo: Obligatorio
     * - ponderación: Obligatorio y > 0
     * 
     * FLUJO:
     * 1. Valida campos básicos
     * 2. Envía POST /api/calificaciones/evaluaciones
     * 3. Cierra diálogo si éxito
     * 4. Recarga lista de evaluaciones
     * 5. Muestra toast de éxito/error
     */
    guardarEvaluacion(): void {
        if (!this.formEvaluacion.nombre || !this.formEvaluacion.tipo || !this.formEvaluacion.ponderacion) {
            this.showWarn('Completa nombre, tipo y ponderacion');
            return;
        }

        // Validación local: verificar si la ponderación total será válida
        const totalConNueva = this.ponderacionTotal() + Number(this.formEvaluacion.ponderacion || 0);
        if (totalConNueva > 100) {
            const disponible = 100 - this.ponderacionTotal();
            this.showWarn(
                `La ponderacion total superaria 100%. Espacio disponible: ${disponible.toFixed(2)}%`
            );
            return;
        }

        if (this.ponderacionTotal() >= 100) {
            this.showWarn('Ya se ha utilizado el 100% del periodo. Edita una evaluacion existente para cambiar su ponderacion.');
            return;
        }

        this.guardandoEvaluacion = true;

        const operacion$ = this.modoEdicion
            ? this.calificacionService.actualizarEvaluacion(this.evaluacionEditandoId, this.formEvaluacion)
            : this.calificacionService.crearEvaluacion(this.formEvaluacion);

        operacion$.subscribe({
            next: (response) => {
                this.guardandoEvaluacion = false;
                if (response.codigo !== 201 && response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudo guardar la evaluacion');
                    return;
                }
                this.dialogEvaluacion = false;
                this.messageService.add({
                    severity: 'success',
                    summary: this.modoEdicion ? 'Evaluacion actualizada' : 'Evaluacion creada',
                    detail: this.modoEdicion
                        ? 'Los cambios fueron guardados correctamente'
                        : 'La evaluacion fue registrada correctamente',
                    life: 3000,
                });
                this.cargarEvaluaciones();
            },
            error: (e) => {
                this.guardandoEvaluacion = false;
                this.showError(e, this.modoEdicion ? 'No se pudo actualizar la evaluacion' : 'No se pudo guardar la evaluacion');
            },
        });
    }

    /**
     * OPERACIÓN: Guardar calificaciones (notas) de múltiples estudiantes
     * 
     * PRECONDICIONES:
     * - Plantilla cargada (evaluación seleccionada)
     * - Usuario tiene permiso para editar
     * - Evaluación está en estado ABIERTA
     * 
     * LÓGICA:
     * 1. Filtra estudiantes que tienen nota ingresada
     * 2. Construye array de CalificacionDetalleRequest (id_inscripcion + nota)
     * 3. Si modifica nota existente: requiere razonCambio (auditoría)
     * 4. Envía POST /api/calificaciones con todas las notas
     * 5. Backend registra cambios en tabla CalificacionCambio
     * 6. Recarga plantilla y resumen
     * 
     * VALIDACIONES:
     * - Al menos 1 nota debe ingresarse
     * - Razón de cambio obligatoria si se modifica nota previa
     * - Nota dentro de rango según escala
     */
    guardarNotas(): void {
        const plantilla = this.plantilla();
        if (!plantilla) {
            this.showWarn('Primero carga una evaluacion');
            return;
        }
        if (!this.puedeEditarNotas()) {
            this.showWarn('No tienes permiso para editar esta evaluacion');
            return;
        }

        // Construye array de notas a guardar
        const detalles: CalificacionDetalleRequest[] = plantilla.estudiantes
            .filter((estudiante) => this.tieneNota(estudiante))  // Solo con notas ingresadas
            .map((estudiante) => ({
                idInscripcion: estudiante.idInscripcion,
                notaNumerica: plantilla.evaluacion.escala === 'NUMERICA' ? estudiante.notaNumerica ?? null : null,
                notaLiteral: plantilla.evaluacion.escala === 'LITERAL' ? estudiante.notaLiteral ?? null : null,
                razonCambio: this.razonesCambio[estudiante.idInscripcion] || null,
            }));

        if (detalles.length === 0) {
            this.showWarn('Registra al menos una calificacion');
            return;
        }

        this.guardandoNotas = true;
        this.calificacionService.guardarCalificaciones({
            idEvaluacion: plantilla.idEvaluacion,
            detalles,
        }).subscribe({
            next: (response) => {
                this.guardandoNotas = false;
                if (response.codigo !== 201 && response.codigo !== 200) {
                    this.showWarn(response.mensaje || 'No se pudieron guardar las calificaciones');
                    return;
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Calificaciones guardadas',
                    detail: 'Las notas fueron registradas correctamente',
                    life: 3000,
                });
                this.plantilla.set(response.data);
                this.razonesCambio = {};  // Limpia razones después de guardar
                this.cargarResumen();     // Recarga resumen
            },
            error: (e) => {
                this.guardandoNotas = false;
                this.showError(e, 'No se pudieron guardar las calificaciones');
            },
        });
    }

    /**
     * OPERACIÓN: Cargar resumen de desempeño (notas consolidadas)
     * 
     * PRECONDICIONES:
     * - idAsignacionDocente (para obtener materia) y periodo deben estar establecidos
     * 
     * CONTENIDO DEL RESUMEN:
     * - Nota consolidada = Σ(nota × ponderación / 100)
     * - Estado académico: APROBADO (≥ nota_minima) o EN_RIESGO
     * - Ponderación total registrada vs esperada
     * - Listado de evaluaciones del período
     * 
     * CASOS DE USO:
     * - Ver desempeño de todos los estudiantes
     * - Identificar estudiantes en riesgo (EN_RIESGO)
     * - Verificar completitud de calificaciones
     * 
     * LLAMADA SILENCIOSA: Si falla, no muestra error (solo pasa silenciosamente)
     */
    cargarResumen(): void {
        // Se necesita una asignación (idAsignacionDocente) para obtener el contexto completo.
        // Se busca en asignaciones la primera que pertenezca a idMateria actual.
        if (!this.idMateria || !this.periodo) return;
        
        const asignacion = this.asignaciones().find(a => a.idMateria === this.idMateria);
        if (!asignacion) return;
        
        this.calificacionService.obtenerResumen(asignacion.idAsignacionDocente, this.periodo).subscribe({
            next: (response) => {
                if (response.codigo === 200) {
                    this.resumen.set(response.data);
                }
            },
        });
    }

    /**
     * EVENT: Cambio de nota numérica en tabla
     * 
     * Cuando usuario ingresa una nota numérica (0-100):
     * 1. Actualiza notaNumerica del estudiante
     * 2. Limpia notaLiteral (solo una escala activa)
     * 
     * @param estudiante Fila de estudiante siendo editada
     * @param nota Valor numérico ingresado
     */
    cambiarNotaNumerica(estudiante: CalificacionEstudianteResponse, nota: number | null): void {
        this.actualizarEstudiante(estudiante.idInscripcion, {
            notaNumerica: nota,
            notaLiteral: null,
        });
    }

    /**
     * EVENT: Cambio de nota literal en tabla
     * 
     * Cuando usuario selecciona nota literal (A-F):
     * 1. Actualiza notaLiteral del estudiante
     * 2. Limpia notaNumerica (solo una escala activa)
     * 
     * @param estudiante Fila de estudiante siendo editada
     * @param nota Letra ingresada (A, B, C, D, F)
     */
    cambiarNotaLiteral(estudiante: CalificacionEstudianteResponse, nota: string | null): void {
        this.actualizarEstudiante(estudiante.idInscripcion, {
            notaNumerica: null,
            notaLiteral: nota,
        });
    }

    /**
     * VALIDACIÓN: Puede editar notas de esta evaluación
     * 
     * Retorna true si:
     * 1. Plantilla está cargada
     * 2. Evaluación está ABIERTA (puedeEditar=true)
     * 3. Usuario tiene rol DOCENTE/ADMIN/SUPER_ADMIN
     * 4. O usuario tiene permiso CALIFICACIONES_WRITE
     * 
     * @return true si puede ingresar/modificar notas
     */
    puedeEditarNotas(): boolean {
        const plantilla = this.plantilla();
        if (!plantilla) return false;
        return plantilla.puedeEditar && (
            this.authService.hasRole('DOCENTE')
            || this.authService.hasRole('ADMIN_INSTITUCION')
            || this.authService.hasRole('SUPER_ADMIN')
            || this.authService.hasPermission('CALIFICACIONES_WRITE')
        );
    }

    /**
     * HELPER: Etiqueta para mostrar asignación en dropdown
     * 
     * Formato: "MATERIA - CURSO PARALELO"
     * Ejemplo: "Matemáticas - 1ro A"
     * 
     * @param asignacion Asignación a formatear
     * @return Etiqueta legible
     */
    asignacionLabel(asignacion: CalificacionAsignacionResponse): string {
        return `${asignacion.nombreMateria} - ${asignacion.nombreCurso} ${asignacion.nombreParalelo}`;
    }

    /**
     * HELPER: Determina color de etiqueta para estado
     * 
     * PrimeNG tag severities:
     * - ABIERTA/APROBADO: success (verde)
     * - CERRADA/EN_RIESGO: warn (amarillo/naranja)
     * - ANULADA: danger (rojo)
     * 
     * @param estado Estado a colorear
     * @return Severity para PrimeNG Tag
     */
    estadoSeverity(estado: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
        switch (estado) {
            case 'ABIERTA':
            case 'APROBADO':
                return 'success';
            case 'CERRADA':
            case 'EN_RIESGO':
                return 'warn';
            case 'ANULADA':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    /**
     * HELPER: Crea nuevo formulario vacío para evaluación
     * 
     * Valores iniciales:
     * - idMateria: Seleccionada actualmente
     * - periodo: Período actual
     * - tipo: PARCIAL (default)
     * - ponderacion: 10 (default)
     * - escala: NUMERICA (default)
     * - estado: ABIERTA (default)
     * 
     * @return Objeto EvaluacionRequest vacío con defaults
     */
    private nuevaEvaluacionForm(): EvaluacionRequest {
        return {
            idMateria: this.idMateria,
            periodo: this.periodo,
            tipo: 'PARCIAL',
            nombre: '',
            ponderacion: 10,
            escala: 'NUMERICA',
            estado: 'ABIERTA',
        };
    }

    /**
     * HELPER: Valida si estudiante tiene nota ingresada
     * 
     * Según la escala de la evaluación:
     * - NUMERICA: verifica notaNumerica !== null
     * - LITERAL: verifica notaLiteral es truthy
     * 
     * @param estudiante Estudiante a validar
     * @return true si tiene nota válida
     */
    private tieneNota(estudiante: CalificacionEstudianteResponse): boolean {
        const plantilla = this.plantilla();
        if (!plantilla) return false;
        if (plantilla.evaluacion.escala === 'NUMERICA') {
            return estudiante.notaNumerica !== null && estudiante.notaNumerica !== undefined;
        }
        return !!estudiante.notaLiteral;
    }

    /**
     * HELPER: Actualiza estado de un estudiante en la plantilla
     * 
     * Realiza merge reactivo (no muta el array):
     * 1. Busca estudiante por idInscripcion
     * 2. Fusiona propiedades con patch
     * 3. Recrea plantilla con signal.set (trigger de Angular)
     * 
     * UTILIDAD:
     * - Cuando usuario cambia nota
     * - Cuando usuario limpia nota
     * 
     * @param idInscripcion ID de inscripción del estudiante
     * @param patch Propiedades a actualizar (merge parcial)
     */
    private actualizarEstudiante(idInscripcion: string, patch: Partial<CalificacionEstudianteResponse>): void {
        const plantilla = this.plantilla();
        if (!plantilla) return;
        this.plantilla.set({
            ...plantilla,
            estudiantes: plantilla.estudiantes.map((estudiante) =>
                estudiante.idInscripcion === idInscripcion
                    ? { ...estudiante, ...patch }
                    : estudiante
            ),
        });
    }

    /**
     * HELPER: Muestra toast de warning/alerta
     * 
     * @param detail Mensaje a mostrar
     */
    private showWarn(detail: string): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Atencion',
            detail,
            life: 3500,
        });
    }

    /**
     * HELPER: Muestra toast de error con manejo de excepciones
     * 
     * Intenta extraer mensaje de:
     * 1. error.error.mensaje (respuesta HTTP)
     * 2. error.message (excepción)
     * 3. fallback (parámetro)
     * 
     * @param error Objeto de error
     * @param fallback Mensaje por defecto si no puede extraer
     */
    private showError(error: any, fallback: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.mensaje ?? error?.message ?? fallback,
            life: 4500,
        });
    }
}
