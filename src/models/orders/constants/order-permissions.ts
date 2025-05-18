import { Permission } from 'src/common/constants/permissions.enum';

export enum OrderPermissionsEnum {
  VIEW_OWN = 'view_own:orders',
  CREATE_OWN = 'create_own:orders',
  CANCEL_OWN = 'cancel_own:orders',
  VIEW_ANY = 'view_any:orders',
  UPDATE_ANY_STATUS = 'update_any_status:orders',
  MANAGE_ANY = 'manage_any:orders', // Permisos amplios para admin
}

export const OrderPermissions: Record<
  keyof typeof OrderPermissionsEnum,
  Permission
> = {
  VIEW_OWN: {
    name: OrderPermissionsEnum.VIEW_OWN,
    description: 'Ver mis propios pedidos',
  },
  CREATE_OWN: {
    name: OrderPermissionsEnum.CREATE_OWN,
    description: 'Crear pedidos para mí mismo',
  },
  CANCEL_OWN: {
    name: OrderPermissionsEnum.CANCEL_OWN,
    description: 'Cancelar mis propios pedidos (bajo ciertas condiciones)',
  },
  VIEW_ANY: {
    name: OrderPermissionsEnum.VIEW_ANY,
    description: 'Ver cualquier pedido (Admin)',
  },
  UPDATE_ANY_STATUS: {
    name: OrderPermissionsEnum.UPDATE_ANY_STATUS,
    description: 'Actualizar estado de cualquier pedido (Admin)',
  },
  MANAGE_ANY: {
    name: OrderPermissionsEnum.MANAGE_ANY,
    description: 'Gestionar todos los aspectos de los pedidos (Admin)',
  },
};
