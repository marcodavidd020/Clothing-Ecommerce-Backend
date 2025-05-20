import { Permission } from 'src/common/constants/permissions.enum';

/**
 * Permisos relacionados con permisos
 */
export enum PermissionPermissionsEnum {
  VIEW = 'permissions.view',
  ASSIGN = 'permissions.assign',
  CREATE = 'permissions.create',
  UPDATE = 'permissions.update',
  DELETE = 'permissions.delete',
}

/**
 * Permisos de permisos con descripciones
 */
export const PermissionPermissions: Record<
  keyof typeof PermissionPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: PermissionPermissionsEnum.VIEW,
    description: 'Ver permisos',
  },
  ASSIGN: {
    name: PermissionPermissionsEnum.ASSIGN,
    description: 'Asignar permisos a roles',
  },
  CREATE: {
    name: PermissionPermissionsEnum.CREATE,
    description: 'Crear permisos',
  },
  UPDATE: {
    name: PermissionPermissionsEnum.UPDATE,
    description: 'Actualizar permisos',
  },
  DELETE: {
    name: PermissionPermissionsEnum.DELETE,
    description: 'Eliminar permisos',
  },
};
