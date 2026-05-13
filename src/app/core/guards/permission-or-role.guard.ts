import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function permissionOrRoleGuard(permissions: string[], roles: string[] = []): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        const user = auth.getCurrentUser();

        if (!user) {
            return router.createUrlTree(['/auth/login']);
        }

        const hasPermission = permissions.some(permission => auth.hasPermission(permission));
        const hasRole = roles.some(role => auth.hasRole(role));

        return hasPermission || hasRole ? true : router.createUrlTree(['/auth/access']);
    };
}
