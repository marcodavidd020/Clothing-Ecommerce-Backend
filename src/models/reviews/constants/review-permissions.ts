import { Permission } from 'src/common/constants/permissions.enum';

export enum ReviewPermissionsEnum {
  // Permisos para usuarios sobre sus propias reseñas
  CREATE_OWN_REVIEW = 'create_own:reviews',
  VIEW_OWN_REVIEWS = 'view_own:reviews',
  UPDATE_OWN_REVIEW = 'update_own:reviews',
  DELETE_OWN_REVIEW = 'delete_own:reviews',

  // Permisos para administradores sobre cualquier reseña
  VIEW_ANY_REVIEW = 'view_any:reviews',
  UPDATE_ANY_REVIEW = 'update_any:reviews',
  DELETE_ANY_REVIEW = 'delete_any:reviews',
  MANAGE_ANY_REVIEW = 'manage_any:reviews', // Permiso global para admin
}

export const ReviewPermissions: Record<
  keyof typeof ReviewPermissionsEnum,
  Permission
> = {
  CREATE_OWN_REVIEW: {
    name: ReviewPermissionsEnum.CREATE_OWN_REVIEW,
    description: 'Crear reseñas para mis propios productos comprados',
  },
  VIEW_OWN_REVIEWS: {
    name: ReviewPermissionsEnum.VIEW_OWN_REVIEWS,
    description: 'Ver mis propias reseñas',
  },
  UPDATE_OWN_REVIEW: {
    name: ReviewPermissionsEnum.UPDATE_OWN_REVIEW,
    description: 'Actualizar mis propias reseñas',
  },
  DELETE_OWN_REVIEW: {
    name: ReviewPermissionsEnum.DELETE_OWN_REVIEW,
    description: 'Eliminar mis propias reseñas',
  },
  VIEW_ANY_REVIEW: {
    name: ReviewPermissionsEnum.VIEW_ANY_REVIEW,
    description: 'Ver cualquier reseña (Admin)',
  },
  UPDATE_ANY_REVIEW: {
    name: ReviewPermissionsEnum.UPDATE_ANY_REVIEW,
    description: 'Actualizar cualquier reseña (Admin)',
  },
  DELETE_ANY_REVIEW: {
    name: ReviewPermissionsEnum.DELETE_ANY_REVIEW,
    description: 'Eliminar cualquier reseña (Admin)',
  },
  MANAGE_ANY_REVIEW: {
    name: ReviewPermissionsEnum.MANAGE_ANY_REVIEW,
    description: 'Gestionar todos los aspectos de las reseñas (Admin)',
  },
};
