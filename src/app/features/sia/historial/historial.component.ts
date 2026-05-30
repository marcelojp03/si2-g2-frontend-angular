import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { EstudiantesService } from '@/features/sia/estudiantes/services/estudiantes.service';
import { GestionesService } from '@/features/sia/gestiones/services/gestiones.service';
import {
    EstudianteResponse,
    GestionAcademicaResponse,
    HistorialAcademicoResponse,
    HistorialEvaluacionResponse,
    HistorialGestionResponse,
    HistorialMateriaResponse,
} from '@/core/models/sia.models';
import { HistorialService } from './historial.service';

type PrimeTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
    selector: 'app-historial',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        SelectModule,
        TagModule,
        ToastModule,
        AccordionModule,
    ],
    providers: [MessageService],
    templateUrl: './historial.component.html',
})
export class HistorialComponent implements OnInit {
    private estudiantesService = inject(EstudiantesService);
    private gestionesService = inject(GestionesService);
    private historialService = inject(HistorialService);
    private messageService = inject(MessageService);

    estudiantes = signal<EstudianteResponse[]>([]);
    gestiones = signal<GestionAcademicaResponse[]>([]);
    historial = signal<HistorialAcademicoResponse | null>(null);

    idEstudianteSeleccionado: string | null = null;
    idGestionSeleccionada: string | null = null;

    cargandoFiltros = false;
    cargandoHistorial = false;

    ngOnInit(): void {
        this.cargarFiltros();
    }

    cargarFiltros(): void {
        this.cargandoFiltros = true;
        this.estudiantesService.listarEstudiantes().subscribe({
            next: (res) => {
                if (res.codigo === 200) this.estudiantes.set(res.data ?? []);
            },
            complete: () => { this.cargandoFiltros = false; },
        });
        this.gestionesService.listarGestiones().subscribe({
            next: (res) => {
                if (res.codigo === 200) this.gestiones.set(res.data ?? []);
            },
        });
    }

    buscarHistorial(): void {
        if (!this.idEstudianteSeleccionado) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Seleccione un estudiante' });
            return;
        }
        this.cargandoHistorial = true;
        this.historial.set(null);
        this.historialService
            .obtenerHistorial(this.idEstudianteSeleccionado, this.idGestionSeleccionada ?? undefined)
            .subscribe({
                next: (res) => {
                    if (res.codigo === 200) {
                        this.historial.set(res.data ?? null);
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje });
                    }
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial' });
                },
                complete: () => { this.cargandoHistorial = false; },
            });
    }

    promedioColor(promedio: number | null): PrimeTagSeverity {
        if (promedio === null || promedio === undefined) return 'secondary';
        if (promedio >= 51) return 'success';
        if (promedio >= 40) return 'warn';
        return 'danger';
    }

    asistenciaColor(porcentaje: number): PrimeTagSeverity {
        if (porcentaje >= 80) return 'success';
        if (porcentaje >= 60) return 'warn';
        return 'danger';
    }
}
