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
  VIEW = 'users.view',
  CREATE = 'users.create',
  UPDATE = 'users.update',
  DELETE = 'users.delete',
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

/**
 * Todos los permisos en un solo objeto para facilitar importaciones
 */
export const ALL_PERMISSIONS = {
  USER: UserPermissions,
  ROLE: RolePermissions,
  PERMISSION: PermissionPermissions,
  CLIENT: ClientPermissions,
  ADDRESS: AddressPermissions,
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
];
