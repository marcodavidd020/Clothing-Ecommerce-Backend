import { Permission } from 'src/common/constants/permissions.enum';

export enum CouponPermissionsEnum {
  VIEW = 'view:coupons',
  CREATE = 'create:coupons',
  UPDATE = 'update:coupons',
  DELETE = 'delete:coupons',
  APPLY = 'apply:coupons', // Permiso para que un usuario aplique un cupón
}

export const CouponPermissions: Record<
  keyof typeof CouponPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: CouponPermissionsEnum.VIEW,
    description: 'Ver cupones (administración)',
  },
  CREATE: {
    name: CouponPermissionsEnum.CREATE,
    description: 'Crear cupones (administración)',
  },
  UPDATE: {
    name: CouponPermissionsEnum.UPDATE,
    description: 'Actualizar cupones (administración)',
  },
  DELETE: {
    name: CouponPermissionsEnum.DELETE,
    description: 'Eliminar cupones (administración)',
  },
  APPLY: {
    name: CouponPermissionsEnum.APPLY,
    description: 'Aplicar cupones a una orden (usuario final)',
  },
};
