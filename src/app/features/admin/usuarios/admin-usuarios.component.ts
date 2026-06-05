import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { UsuarioService } from '@/core/services/usuario.service';
import { InstitucionService } from '@/core/services/institucion.service';
import { AuthService } from '@/core/services/auth.service';
import { RoleService } from '@/core/services/role.service';
import { CanPermDirective } from '@/shared/directives/can-perm.directive';
import {
    UsuarioResponse, CrearUsuarioRequest, ActualizarUsuarioRequest,
    AsignarRolRequest, InstitucionResponse, RolResponse
} from '@/core/models/sia.models';

@Component({
    selector: 'app-admin-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, TagModule,
        InputTextModule, InputIconModule, IconFieldModule, DialogModule, TooltipModule,
        ConfirmDialogModule, SelectModule, PasswordModule, CanPermDirective],
    providers: [MessageService, ConfirmationService],
    templateUrl: './admin-usuarios.component.html'
})
export class AdminUsuariosComponent implements OnInit {
    private usuarioService = inject(UsuarioService);
    private institucionService = inject(InstitucionService);
    private authService = inject(AuthService);
    private roleService = inject(RoleService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    private get isSuperAdmin(): boolean {
        return this.authService.getCurrentUser()?.roles.includes('SUPER_ADMIN') ?? false;
    }

    usuarios = signal<UsuarioResponse[]>([]);
    instituciones = signal<InstitucionResponse[]>([]);
    rolesDisponibles = signal<RolResponse[]>([]);
    loading = true;

    dialogVisible = false;
    selectedId = '';
    form: CrearUsuarioRequest = { correo: '', contrasena: '', nombres: '', apellidos: '', idInstitucion: undefined, idRol: undefined, codigoRol: undefined };

    rolesVisible = false;
    usuarioRoles: UsuarioResponse | null = null;
    rolSeleccionado = '';

    editarVisible = false;
    editForm: ActualizarUsuarioRequest = { nombres: '', apellidos: '', telefono: '' };
    editId = '';

    @ViewChild('dt') dt!: Table;

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        const user = this.authService.getCurrentUser();
        const instituciones$ = this.isSuperAdmin
            ? this.institucionService.listar().pipe(map(r => r.data ?? []))
            : user?.idInstitucion
                ? this.institucionService.obtenerActual().pipe(map(r => r.data ? [r.data] : []))
                : of([]);

        forkJoin({
            usuarios: this.usuarioService.listar(),
            instituciones: instituciones$,
            roles: this.roleService.listarRolesAsignables()
        }).subscribe({
            next: ({ usuarios, instituciones, roles }) => {
                this.loading = false;
                if (usuarios.codigo === 200) this.usuarios.set(usuarios.data ?? []);
                this.instituciones.set(instituciones);
                if (roles.codigo === 200) this.rolesDisponibles.set(roles.data ?? []);
            },
            error: () => { this.loading = false; this.error('No se pudo cargar la informacion'); }
        });
    }

    nuevo(): void {
        this.form = { correo: '', contrasena: '', nombres: '', apellidos: '', idInstitucion: undefined, idRol: undefined, codigoRol: undefined };
        this.dialogVisible = true;
    }

    guardar(): void {
        if (!this.form.correo || !this.form.nombres || !this.form.apellidos) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Correo, nombres y apellidos son requeridos', life: 3000 });
            return;
        }
        if (!this.form.contrasena) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'La contrasena es requerida', life: 3000 });
            return;
        }
        if (!this.form.idRol) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Seleccione un rol inicial', life: 3000 });
            return;
        }
        const rolSeleccionado = this.rolesDisponibles().find(r => r.id === this.form.idRol);
        if (!rolSeleccionado) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'El rol seleccionado no es valido', life: 3000 });
            return;
        }
        const body: CrearUsuarioRequest = {
            correo: this.form.correo.trim(),
            contrasena: this.form.contrasena,
            nombres: this.form.nombres.trim(),
            apellidos: this.form.apellidos.trim(),
            idInstitucion: this.form.idInstitucion || undefined,
            idRol: rolSeleccionado.id,
            codigoRol: rolSeleccionado.codigo
        };
        this.usuarioService.crear(body).subscribe({
            next: () => {
                this.dialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Usuario creado correctamente', life: 3000 });
                this.load();
            },
            error: (e: any) => this.error(e.error?.mensaje ?? 'Error al crear el usuario')
        });
    }

    confirmarEliminar(u: UsuarioResponse): void {
        this.confirmationService.confirm({
            message: `Eliminar al usuario "${u.nombres} ${u.apellidos}"?`,
            header: 'Confirmar eliminacion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.usuarioService.eliminar(u.id).subscribe({
                next: () => { this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado', life: 3000 }); this.load(); },
                error: () => this.error('No se pudo eliminar el usuario')
            })
        });
    }

    abrirRoles(u: UsuarioResponse): void {
        this.usuarioRoles = u;
        this.rolSeleccionado = '';
        this.rolesVisible = true;
    }

    abrirEditar(u: UsuarioResponse): void {
        this.editId = u.id;
        this.editForm = { nombres: u.nombres, apellidos: u.apellidos, telefono: u.telefono ?? '' };
        this.editarVisible = true;
    }

    guardarEdicion(): void {
        if (!this.editForm.nombres || !this.editForm.apellidos) {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Nombres y apellidos son requeridos', life: 3000 });
            return;
        }
        this.usuarioService.actualizar(this.editId, this.editForm).subscribe({
            next: () => {
                this.editarVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente', life: 3000 });
                this.load();
            },
            error: (e: any) => this.error(e.error?.mensaje ?? 'Error al actualizar el usuario')
        });
    }

    guardarRoles(): void {
        if (!this.usuarioRoles || !this.rolSeleccionado) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Seleccione un rol', life: 3000 });
            return;
        }
        const rol = this.rolesDisponibles().find(r => r.id === this.rolSeleccionado);
        if (!rol) {
            this.messageService.add({ severity: 'warn', summary: 'Atencion', detail: 'Seleccione un rol valido', life: 3000 });
            return;
        }
        const body: AsignarRolRequest = { idRol: rol.id, codigoRol: rol.codigo };
        this.usuarioService.asignarRol(this.usuarioRoles.id, body).subscribe({
            next: () => {
                this.rolesVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Exito', detail: 'Rol asignado correctamente', life: 3000 });
                this.load();
            },
            error: (e: any) => this.error(e.error?.mensaje ?? 'Error al asignar rol')
        });
    }

    get rolesOptions() {
        return this.rolesDisponibles().map(r => ({
            label: r.esGlobal ? `${r.nombre} (base)` : `${r.nombre} (institucional)`,
            value: r.id
        }));
    }

    get institucionesOptions() {
        return this.instituciones().map(i => ({ label: i.nombre, value: i.id }));
    }

    getNombreInstitucion(idInstitucion?: string): string {
        if (!idInstitucion) return '-';
        return this.instituciones().find(i => i.id === idInstitucion)?.nombre ?? idInstitucion;
    }

    rolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (rol) {
            case 'ADMIN_INSTITUCION': return 'success';
            case 'DIRECTOR': return 'info';
            case 'SECRETARIO': return 'warn';
            case 'DOCENTE': return 'secondary';
            default: return 'secondary';
        }
    }

    onGlobalFilter(t: Table, e: Event): void { t.filterGlobal((e.target as HTMLInputElement).value, 'contains'); }
    private error(msg: string): void { this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 }); }
}
