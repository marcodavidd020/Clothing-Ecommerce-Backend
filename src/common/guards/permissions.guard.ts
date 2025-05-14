import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/metadata/permissions.metadata';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario (no autenticado), denegar acceso
    if (!user) {
      throw new ForbiddenException('Acceso denegado');
    }

    // Verificar si el usuario tiene alguno de los permisos requeridos
    for (const permission of requiredPermissions) {
      // Llamamos hasPermission de forma asíncrona y esperamos por su resultado
      const hasPermission = await user.hasPermission(permission);
      if (hasPermission) {
        return true;
      }
    }

    throw new ForbiddenException(
      `No tienes permiso para realizar esta acción. Se requiere uno de estos permisos: ${requiredPermissions.join(', ')}`,
    );
  }
}
