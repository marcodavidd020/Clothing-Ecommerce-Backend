import { Permission } from 'src/common/constants/permissions.enum';

export enum UserCouponPermissionsEnum {
  VIEW_OWN = 'view_own:user_coupons', // Ver los cupones asignados a uno mismo
  ASSIGN = 'assign:user_coupons', // Asignar un cupón a un usuario (admin)
  REVOKE = 'revoke:user_coupons', // Revocar un cupón de un usuario (admin)
  MARK_AS_USED = 'mark_as_used:user_coupons', // Marcar un cupón como usado (puede ser el usuario o admin)
  VIEW_ALL = 'view_all:user_coupons', // Ver todas las asignaciones de cupones (admin)
}

export const UserCouponPermissions: Record<
  keyof typeof UserCouponPermissionsEnum,
  Permission
> = {
  VIEW_OWN: {
    name: UserCouponPermissionsEnum.VIEW_OWN,
    description: 'Ver mis cupones asignados',
  },
  ASSIGN: {
    name: UserCouponPermissionsEnum.ASSIGN,
    description: 'Asignar cupones a usuarios (Admin)',
  },
  REVOKE: {
    name: UserCouponPermissionsEnum.REVOKE,
    description: 'Revocar cupones de usuarios (Admin)',
  },
  MARK_AS_USED: {
    name: UserCouponPermissionsEnum.MARK_AS_USED,
    description: 'Marcar un cupón como usado',
  },
  VIEW_ALL: {
    name: UserCouponPermissionsEnum.VIEW_ALL,
    description: 'Ver todas las asignaciones de cupones (Admin)',
  },
};
