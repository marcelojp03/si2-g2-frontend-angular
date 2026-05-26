import { Directive, Input, OnInit, ElementRef, inject } from '@angular/core';
import { AuthzService } from '../../core/services/authz.service';

/**
 * Directiva de atributo que deshabilita el elemento (input, button, select…)
 * si el usuario no tiene edición sobre el campo especificado.
 *
 * Uso:
 * <input [appCanEdit]="['academico', 'calificacion', 'nota_final']" />
 */
@Directive({
  selector: '[appCanEdit]',
  standalone: true
})
export class CanEditDirective implements OnInit {
  @Input('appCanEdit') campos!: [string, string, string];

  private el = inject(ElementRef);
  private authz = inject(AuthzService);

  ngOnInit(): void {
    const [modulo, entidad, campo] = this.campos ?? ['', '', ''];
    if (!this.authz.canEdit(modulo, entidad, campo)) {
      const native = this.el.nativeElement as HTMLElement;
      native.setAttribute('disabled', 'true');
      (native as HTMLInputElement).disabled = true;
    }
  }
}
