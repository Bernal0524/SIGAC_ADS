import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// CORRECCIÓN: Ajuste de ruta para subir 3 niveles hasta llegar a src/common
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Verificamos si el usuario existe (inyectado por JwtAuthGuard) y su rol
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Acceso denegado: Se requiere rol de ${requiredRoles.join(' o ')}`
      );
    }

    return true;
  }
}