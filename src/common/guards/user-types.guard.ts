import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPES_KEY } from '../constants/settings';

/**
 * Guard para restringir acceso basado en roles de usuario
 *
 * Uso:
 * @UserTypes('admin', 'manager')
 * @UseGuards(JwtAuthGuard, UserTypesGuard)
 */
@Injectable()
export class UserTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles permitidos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      USER_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del request (puesto por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Validar que el usuario tenga al menos uno de los roles requeridos
    return user && user.roles && this.matchRoles(requiredRoles, user.roles);
  }

  private matchRoles(required: string[], userRoles: string[]): boolean {
    return required.some((role) => userRoles.includes(role));
  }
}
