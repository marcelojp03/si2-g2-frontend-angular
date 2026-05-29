import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { AuthService } from '@/core/services/auth.service';
import { RoleService } from '@/core/services/role.service';
import { PermisoResponse, RolRequest, RolResponse } from '@/core/models/sia.models';

@Component({
    selector: 'app-roles',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, DialogModule,
        InputTextModule, TextareaModule, ConfirmDialogModule, CheckboxModule, TagModule],
    providers: [MessageService, ConfirmationService],
    templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
    private roleService = inject(RoleService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    roles = signal<RolResponse[]>([]);
    permisos = signal<PermisoResponse[]>([]);
    loading = true;
    dialogVisible = false;
    editId: string | null = null;

    form: RolRequest = { nombre: '', descripcion: '', idsPermiso: [] };
    editingGlobalRole = false;

    get isSuperAdmin(): boolean {
        return this.authService.isSuperAdmin();
    }

    canEditRole(rol: RolResponse): boolean {
        if (this.isSuperAdmin) {
            return rol.codigo !== 'SUPER_ADMIN';
        }
        return rol.editable;
    }

    canDeleteRole(rol: RolResponse): boolean {
        if (this.isSuperAdmin) {
            return this.canEditRole(rol);
        }
        return rol.editable && !rol.esGlobal;
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.roleService.listarRoles().subscribe({
            next: rolesResp => {
                this.roleService.listarPermisos().subscribe({
                    next: permisosResp => {
                        this.loading = false;
                        if (rolesResp.codigo === 200) {
                            this.roles.set(rolesResp.data ?? []);
                        }
                        if (permisosResp.codigo === 200) this.permisos.set(permisosResp.data ?? []);
                    },
                    error: () => { this.loading = false; this.error('No se pudieron cargar los permisos'); }
                });
            },
            error: () => { this.loading = false; this.error('No se pudieron cargar los roles'); }
        });
    }

    nuevo(): void {
        if (this.isSuperAdmin) {
            this.error('La creación de roles institucionales debe hacerse desde una institución');
            return;
        }
        this.editId = null;
        this.form = { nombre: '', descripcion: '', idsPermiso: [] };
        this.dialogVisible = true;
    }

    editar(rol: RolResponse): void {
        if (!this.canEditRole(rol)) return;
        this.editId = rol.id;
        this.editingGlobalRole = rol.esGlobal;
        this.form = {
            nombre: rol.nombre,
            descripcion: rol.descripcion ?? '',
            idsPermiso: rol.permisos.map(p => p.id)
        };
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.nombre.trim() || !this.form.idsPermiso.length) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Nombre y permisos son requeridos', life: 3000 });
            return;
        }

        const request: RolRequest = {
            nombre: this.form.nombre.trim(),
            descripcion: this.form.descripcion?.trim() || undefined,
            idsPermiso: this.form.idsPermiso
        };

        const action = this.editId
            ? this.roleService.actualizarRol(this.editId, request)
            : this.roleService.crearRol(request);

        action.subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.editId ? 'Rol actualizado' : 'Rol creado', life: 3000 });
                this.load();
            },
            error: (e) => this.error(e.error?.mensaje ?? 'No se pudo guardar el rol')
        });
    }

    confirmarEliminar(rol: RolResponse): void {
        if (!this.canDeleteRole(rol)) return;
        this.confirmationService.confirm({
            message: `¿Desactivar el rol "${rol.nombre}"?`,
            header: 'Confirmar desactivación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.roleService.eliminarRol(rol.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Desactivado', detail: 'Rol desactivado', life: 3000 });
                    this.load();
                },
                error: (e) => this.error(e.error?.mensaje ?? 'No se pudo desactivar el rol')
            })
        });
    }

    groupedPermissions(): Array<{ modulo: string; permisos: PermisoResponse[] }> {
        const groups = new Map<string, PermisoResponse[]>();
        for (const permiso of this.permisos()) {
            const current = groups.get(permiso.modulo) ?? [];
            current.push(permiso);
            groups.set(permiso.modulo, current);
        }
        return Array.from(groups.entries()).map(([modulo, list]) => ({ modulo, permisos: list }));
    }

    togglePermiso(idPermiso: string, checked: boolean): void {
        if (checked) {
            this.form.idsPermiso = [...new Set([...this.form.idsPermiso, idPermiso])];
            return;
        }
        this.form.idsPermiso = this.form.idsPermiso.filter(id => id !== idPermiso);
    }

    hasPermiso(idPermiso: string): boolean {
        return this.form.idsPermiso.includes(idPermiso);
    }

    private error(msg: string): void {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
    }
}
