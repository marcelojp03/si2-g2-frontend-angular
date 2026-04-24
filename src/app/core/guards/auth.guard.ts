// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsuarioSIA } from '../models/auth.model';

function evaluateUser(user: UsuarioSIA, router: Router): boolean | import('@angular/router').UrlTree {
  if (user.roles.includes('SUPER_ADMIN')) {
    return router.createUrlTree(['/admin']);
  }
  return true;
}

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginTree = router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });

  if (!auth.isAuthenticated()) {
    return loginTree;
  }

  const user = auth.getCurrentUser();
  if (user) {
    return evaluateUser(user, router);
  }

  auth.loadUserFromToken();
  const reloaded = auth.getCurrentUser();
  return reloaded ? evaluateUser(reloaded, router) : loginTree;
};

export const authMatchGuard: CanMatchFn = (route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginTree = router.createUrlTree(['/auth/login']);

  if (!auth.isAuthenticated()) {
    return loginTree;
  }

  const user = auth.getCurrentUser();
  if (user) {
    return evaluateUser(user, router);
  }

  auth.loadUserFromToken();
  const reloaded = auth.getCurrentUser();
  return reloaded ? evaluateUser(reloaded, router) : loginTree;
};
