import { Permission } from 'src/common/constants/permissions.enum';

// addresses
export enum AddressPermissionsEnum {
  VIEW = 'addresses.view',
  CREATE = 'addresses.create',
  UPDATE = 'addresses.update',
  DELETE = 'addresses.delete',
}

/**
 * Permisos de direcciones con descripciones
 */
export const AddressPermissions: Record<
  keyof typeof AddressPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: AddressPermissionsEnum.VIEW,
    description: 'Ver direcciones',
  },
  CREATE: {
    name: AddressPermissionsEnum.CREATE,
    description: 'Crear direcciones',
  },
  UPDATE: {
    name: AddressPermissionsEnum.UPDATE,
    description: 'Actualizar direcciones',
  },
  DELETE: {
    name: AddressPermissionsEnum.DELETE,
    description: 'Eliminar direcciones',
  },
};
