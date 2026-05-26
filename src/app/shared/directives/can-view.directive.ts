import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthzService } from '../../core/services/authz.service';

/**
 * Directiva estructural que oculta el elemento del DOM si el usuario no tiene visibilidad
 * sobre el campo especificado.
 *
 * Uso:
 * <div *appCanView="['academico', 'calificacion', 'nota_final']">...</div>
 */
@Directive({
  selector: '[appCanView]',
  standalone: true
})
export class CanViewDirective implements OnInit {
  @Input('appCanView') campos!: [string, string, string];

  private templateRef = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private authz = inject(AuthzService);

  ngOnInit(): void {
    const [modulo, entidad, campo] = this.campos ?? ['', '', ''];
    if (this.authz.canView(modulo, entidad, campo)) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }
}
