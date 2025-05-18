import { Permission } from 'src/common/constants/permissions.enum';

export enum PaymentPermissionsEnum {
  VIEW = 'view:payments',
  CREATE = 'create:payments',
  UPDATE = 'update:payments',
  DELETE = 'delete:payments',
}

export const PaymentPermissions: Record<
  keyof typeof PaymentPermissionsEnum,
  Permission
> = {
  VIEW: {
    name: PaymentPermissionsEnum.VIEW,
    description: 'Ver pagos',
  },
  CREATE: {
    name: PaymentPermissionsEnum.CREATE,
    description: 'Crear pagos',
  },
  UPDATE: {
    name: PaymentPermissionsEnum.UPDATE,
    description: 'Actualizar pagos',
  },
  DELETE: {
    name: PaymentPermissionsEnum.DELETE,
    description: 'Eliminar pagos',
  },
};
