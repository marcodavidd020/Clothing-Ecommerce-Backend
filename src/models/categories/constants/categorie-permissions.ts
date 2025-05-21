import { Permission } from 'src/common/constants/permissions.enum';

// Añadir enum para Categorías
export enum CategoryPermissionsEnum {
  CREATE = 'create:categories',
  VIEW = 'view:categories',
  UPDATE = 'update:categories',
  DELETE = 'delete:categories',
}

// Categorías
export const CategoryPermissions: Record<
  keyof typeof CategoryPermissionsEnum,
  Permission
> = {
  CREATE: {
    name: CategoryPermissionsEnum.CREATE,
    description: 'Crear categorías',
  },
  VIEW: {
    name: CategoryPermissionsEnum.VIEW,
    description: 'Ver categorías',
  },
  UPDATE: {
    name: CategoryPermissionsEnum.UPDATE,
    description: 'Actualizar categorías',
  },
  DELETE: {
    name: CategoryPermissionsEnum.DELETE,
    description: 'Eliminar categorías',
  },
};
