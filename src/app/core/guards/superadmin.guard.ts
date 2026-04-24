import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superadminGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const loginTree = router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });

    if (!auth.isAuthenticated()) {
        return loginTree;
    }

    const user = auth.getCurrentUser();
    if (user) {
        return user.roles.includes('SUPER_ADMIN') ? true : router.createUrlTree(['/']);
    }

    auth.loadUserFromToken();
    const reloaded = auth.getCurrentUser();
    if (reloaded) {
        return reloaded.roles.includes('SUPER_ADMIN') ? true : router.createUrlTree(['/']);
    }
    return loginTree;
};
