import { Permission } from 'src/common/constants/permissions.enum';

/**
 * Permisos relacionados con usuarios
 */
export enum UserPermissionsEnum {
  VIEW = 'view:users',
  CREATE = 'create:users',
  UPDATE = 'update:users',
  DELETE = 'delete:users',
}

/**
 * Permisos de usuarios con descripciones
 */
export const UserPermissions: Record<
  keyof typeof UserPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: UserPermissionsEnum.VIEW,
    description: 'Ver usuarios',
  },
  CREATE: {
    name: UserPermissionsEnum.CREATE,
    description: 'Crear usuarios',
  },
  UPDATE: {
    name: UserPermissionsEnum.UPDATE,
    description: 'Actualizar usuarios',
  },
  DELETE: {
    name: UserPermissionsEnum.DELETE,
    description: 'Eliminar usuarios',
  },
};
