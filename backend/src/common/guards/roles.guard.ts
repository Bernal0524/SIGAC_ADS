import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Extraer los roles requeridos definidos en el decorador @Roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    // 2. Obtener el usuario de la petición
    const { user } = context.switchToHttp().getRequest();
    
    // 3. RBAC Estricto: Validar existencia de usuario y coincidencia de rol
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acceso Denegado: Tu rol no tiene permisos para esta funcionalidad de SIGAC');
    }
    
    return true;
  }
}