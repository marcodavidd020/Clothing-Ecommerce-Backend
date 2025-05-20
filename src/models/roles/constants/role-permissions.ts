import { Permission } from 'src/common/constants/permissions.enum';

/**
 * Permisos relacionados con roles
 */
export enum RolePermissionsEnum {
  VIEW = 'roles.view',
  CREATE = 'roles.create',
  UPDATE = 'roles.update',
  DELETE = 'roles.delete',
  ASSIGN = 'roles.assign',
}

/**
 * Permisos de roles con descripciones
 */
export const RolePermissions: Record<
  keyof typeof RolePermissionsEnum,
  Permission
> = {
  VIEW: {
    name: RolePermissionsEnum.VIEW,
    description: 'Ver roles',
  },
  CREATE: {
    name: RolePermissionsEnum.CREATE,
    description: 'Crear roles',
  },
  UPDATE: {
    name: RolePermissionsEnum.UPDATE,
    description: 'Actualizar roles',
  },
  DELETE: {
    name: RolePermissionsEnum.DELETE,
    description: 'Eliminar roles',
  },
  ASSIGN: {
    name: RolePermissionsEnum.ASSIGN,
    description: 'Asignar roles a usuarios',
  },
};
