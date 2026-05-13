import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function permissionGuard(...permissions: string[]): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);

        const user = auth.getCurrentUser();
        if (!user) {
            return router.createUrlTree(['/auth/login']);
        }

        const hasPermission = permissions.some((permission) => auth.hasPermission(permission));
        if (!hasPermission) {
            return router.createUrlTree(['/auth/access']);
        }

        return true;
    };
}
