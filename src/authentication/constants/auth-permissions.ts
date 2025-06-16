import { Permission } from 'src/common/constants/permissions.enum';

/**
 * Permisos relacionados con clientes
 */
export enum ClientPermissionsEnum {
  VIEW = 'clients.view',
  CREATE = 'clients.create',
  UPDATE = 'clients.update',
  DELETE = 'clients.delete',
}

/**
 * Permisos de clientes con descripciones
 */
export const ClientPermissions: Record<
  keyof typeof ClientPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: ClientPermissionsEnum.VIEW,
    description: 'Ver clientes',
  },
  CREATE: {
    name: ClientPermissionsEnum.CREATE,
    description: 'Crear clientes',
  },
  UPDATE: {
    name: ClientPermissionsEnum.UPDATE,
    description: 'Actualizar clientes',
  },
  DELETE: {
    name: ClientPermissionsEnum.DELETE,
    description: 'Eliminar clientes',
  },
};
