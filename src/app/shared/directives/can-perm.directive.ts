import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appCanPerm]',
  standalone: true
})
export class CanPermDirective {
  private permisos: string[] = [];

  @Input('appCanPerm')
  set appCanPerm(value: string[]) {
    this.permisos = value ?? [];
    this.updateView();
  }

  private templateRef = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);
  private visible = false;

  constructor() {
    effect(() => {
      this.auth.currentUserSignal();
      this.updateView();
    });
  }

  private updateView(): void {
    const allowed = this.permisos?.some(p => this.hasPermission(p)) ?? false;
    if (allowed && !this.visible) {
      this.vcr.createEmbeddedView(this.templateRef);
      this.visible = true;
    }
    if (!allowed && this.visible) {
      this.vcr.clear();
      this.visible = false;
    }
  }

  private hasPermission(permission: string): boolean {
    if (this.auth.hasPermission(permission)) return true;
    if (!permission.endsWith('_WRITE')) return false;

    const prefix = permission.slice(0, -'_WRITE'.length);
    return ['CREATE', 'UPDATE', 'DELETE'].some(action => this.auth.hasPermission(`${prefix}_${action}`));
  }
}
