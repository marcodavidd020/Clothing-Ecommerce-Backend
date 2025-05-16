import { Permission } from 'src/common/constants/permissions.enum';

/**
 * Permisos relacionados con carritos de compra
 */
export enum CartPermissionsEnum {
  VIEW = 'view:carts',
  MANAGE_ITEMS = 'manage_items:carts', // Permite añadir, actualizar, eliminar items
  CLEAR = 'clear:carts', // Permite vaciar el carrito
  VIEW_ALL = 'view_all:carts', // Permite ver carritos de otros usuarios (Admin)
  DELETE_ANY = 'delete_any:carts', // Permite eliminar carritos de otros usuarios (Admin)
}

/**
 * Permisos de carritos de compra con descripciones
 */
export const CartPermissions: Record<
  keyof typeof CartPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: CartPermissionsEnum.VIEW,
    description: 'Ver carrito propio',
  },
  MANAGE_ITEMS: {
    name: CartPermissionsEnum.MANAGE_ITEMS,
    description: 'Añadir, actualizar o eliminar items del carrito propio',
  },
  CLEAR: {
    name: CartPermissionsEnum.CLEAR,
    description: 'Vaciar carrito propio',
  },
  VIEW_ALL: {
    name: CartPermissionsEnum.VIEW_ALL,
    description: 'Ver carritos de otros usuarios (Admin)',
  },
  DELETE_ANY: {
    name: CartPermissionsEnum.DELETE_ANY,
    description: 'Eliminar carritos de otros usuarios (Admin)',
  },
};
