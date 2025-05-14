import { HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '../../constants/settings';

/**
 * Helper para formatear respuestas de error
 */

/**
 * Crea una respuesta de error con formato estándar
 */
export function createErrorResponse(
  message: string = 'Error en la operación',
  statusCode: number = HttpStatus.BAD_REQUEST,
  errors: any[] = [],
) {
  return {
    success: false,
    message,
    statusCode,
    errors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crea una respuesta para error 404 (no encontrado)
 */
export function createNotFoundResponse(entityName: string = 'Recurso') {
  return createErrorResponse(
    `${entityName} no encontrado`,
    HttpStatus.NOT_FOUND,
  );
}

/**
 * Crea una respuesta para error 401 (no autorizado)
 */
export function createUnauthorizedResponse(
  message: string = ERROR_MESSAGES.UNAUTHORIZED,
) {
  return createErrorResponse(message, HttpStatus.UNAUTHORIZED);
}

/**
 * Crea una respuesta para error 403 (prohibido)
 */
export function createForbiddenResponse(
  message: string = ERROR_MESSAGES.FORBIDDEN,
) {
  return createErrorResponse(message, HttpStatus.FORBIDDEN);
}

/**
 * Crea una respuesta para error 400 (solicitud incorrecta)
 */
export function createBadRequestResponse(
  message: string = 'Solicitud incorrecta',
  errors: any[] = [],
) {
  return createErrorResponse(message, HttpStatus.BAD_REQUEST, errors);
}
