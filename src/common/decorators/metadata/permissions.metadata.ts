import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Establece los permisos requeridos para un controlador o método
 * @param permissions Lista de permisos requeridos
 * @returns Decorador para establecer metadatos de permisos
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
