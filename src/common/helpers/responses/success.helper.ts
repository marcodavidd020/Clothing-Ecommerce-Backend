import { ISuccessResponse } from '../../interfaces/response.interface';

/**
 * Helper para formatear respuestas exitosas
 */

/**
 * Crea una respuesta exitosa con formato estándar
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Operación exitosa',
): ISuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crea una respuesta para operaciones de creación
 */
export function createCreatedResponse<T>(
  data: T,
  entityName: string = 'Recurso',
): ISuccessResponse<T> {
  return createSuccessResponse(data, `${entityName} creado correctamente`);
}

/**
 * Crea una respuesta para operaciones de actualización
 */
export function createUpdatedResponse<T>(
  data: T,
  entityName: string = 'Recurso',
): ISuccessResponse<T> {
  return createSuccessResponse(data, `${entityName} actualizado correctamente`);
}

/**
 * Crea una respuesta para operaciones de eliminación
 */
export function createDeletedResponse(
  entityName: string = 'Recurso',
): ISuccessResponse<null> {
  return createSuccessResponse(null, `${entityName} eliminado correctamente`);
}
