import { CartPermissions } from 'src/models/carts/constants/cart-permissions';
import { CouponPermissions } from 'src/models/coupons/constants/coupon-permissions';
import { PaymentPermissions } from 'src/models/payments/constants/payment-permissions';
import { ProductPermissions } from 'src/models/products/constants/product-permissions.constant';
import { UserCouponPermissions } from 'src/models/user-coupons/constants/user-coupon-permissions';

/**
 * Interfaz para definir permisos con descripción
 */
export interface Permission {
  name: string;
  description: string;
}

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
 * Permisos relacionados con clientes
 */
export enum ClientPermissionsEnum {
  VIEW = 'clients.view',
  CREATE = 'clients.create',
  UPDATE = 'clients.update',
  DELETE = 'clients.delete',
}

// addresses
export enum AddressPermissionsEnum {
  VIEW = 'addresses.view',
  CREATE = 'addresses.create',
  UPDATE = 'addresses.update',
  DELETE = 'addresses.delete',
}

// Añadir enum para Categorías
export enum CategoryPermissionsEnum {
  CREATE = 'create:categories',
  VIEW = 'view:categories',
  UPDATE = 'update:categories',
  DELETE = 'delete:categories',
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

/**
 * Todos los permisos en un solo objeto para facilitar importaciones
 */
export const ALL_PERMISSIONS = {
  USER: UserPermissions,
  ROLE: RolePermissions,
  PERMISSION: PermissionPermissions,
  CLIENT: ClientPermissions,
  ADDRESS: AddressPermissions,
  CATEGORY: CategoryPermissions,
  PRODUCT: ProductPermissions,
  CART: CartPermissions,
  PAYMENT: PaymentPermissions,
  COUPON: CouponPermissions,
  USER_COUPON: UserCouponPermissions,
};

/**
 * Lista plana de todos los permisos con sus descripciones para seeders
 */
export const PERMISSIONS_LIST: Permission[] = [
  ...Object.values(UserPermissions),
  ...Object.values(RolePermissions),
  ...Object.values(PermissionPermissions),
  ...Object.values(ClientPermissions),
  ...Object.values(AddressPermissions),
  ...Object.values(CategoryPermissions),
  ...Object.values(ProductPermissions),
  ...Object.values(CartPermissions),
  ...Object.values(PaymentPermissions),
  ...Object.values(CouponPermissions),
  ...Object.values(UserCouponPermissions),
];
