import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SuccessSerializer } from '../serializers/responses/success.serializer';
import {
  ErrorSerializer,
  FieldError,
} from '../serializers/responses/error.serializer';

/**
 * Interceptor para transformar todas las respuestas al formato estándar
 *
 * Este interceptor envuelve automáticamente las respuestas exitosas en SuccessSerializer
 * y los errores en ErrorSerializer para mantener un formato consistente en toda la API.
 *
 * Uso:
 * @UseInterceptors(ResponseTransformInterceptor)
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // Transformar respuestas exitosas
      map((data) => {
        // Si ya es un SuccessSerializer, no lo transformamos de nuevo
        if (data instanceof SuccessSerializer) {
          return data;
        }

        // Si el objeto ya tiene la estructura esperada (viene de createSuccessResponse helper)
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'message' in data &&
          'data' in data &&
          'timestamp' in data
        ) {
          return data;
        }

        // Envolver la respuesta en SuccessSerializer
        return new SuccessSerializer({
          message: 'Operación completada con éxito',
          data: data,
        });
      }),

      // Manejar errores
      catchError((error) => {
        // Si ya es un HttpException con un ErrorSerializer, no lo transformamos
        if (
          error instanceof HttpException &&
          error.getResponse() instanceof ErrorSerializer
        ) {
          return throwError(() => error);
        }

        // Si el error ya tiene la estructura esperada (viene de createErrorResponse helper)
        const response = error.getResponse ? error.getResponse() : null;
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          response.success === false &&
          'message' in response &&
          'statusCode' in response &&
          'timestamp' in response
        ) {
          return throwError(() => error);
        }

        // Determinar código y mensaje de error
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let errors: FieldError[] = [];

        if (error instanceof HttpException) {
          statusCode = error.getStatus();

          // Manejar diferentes tipos de respuestas de error
          if (typeof response === 'object') {
            message = response['message'] || message;

            // Si es un error de validación (BadRequestException con array de errores)
            if (Array.isArray(response['message'])) {
              const validationErrors = response['message'];
              message = 'Error de validación en los datos proporcionados';

              // Intenta extraer errores de validación con formato estándar
              errors = validationErrors.map((errMsg) => {
                // Intentar extraer campo y mensaje del formato común "campo: mensaje"
                const matches = errMsg.match(/^([^:]+):\s*(.+)$/);
                if (matches) {
                  return {
                    field: matches[1].trim(),
                    errors: [matches[2].trim()],
                    value: null,
                  };
                }
                return {
                  field: 'unknown',
                  errors: [errMsg],
                  value: null,
                };
              });
            }
            // Si hay un array de errores, usarlo directamente
            else if (Array.isArray(response['errors'])) {
              errors = response['errors'] as FieldError[];
            }
            // Si es un ConflictException (409), crear un error más detallado
            else if (error instanceof ConflictException) {
              // Extraer el campo que causó el conflicto (suele ser email u otro campo único)
              const errorMsg = response['message'] || '';
              const field = errorMsg.toLowerCase().includes('email')
                ? 'email'
                : errorMsg.toLowerCase().includes('username')
                  ? 'username'
                  : 'field';

              errors.push({
                field: field,
                errors: [errorMsg],
                value: null,
              });
            }
            // Si es un UnauthorizedException (401), crear errores detallados
            else if (error instanceof UnauthorizedException) {
              const errorMsg = response['message'] || 'No autorizado';

              // Si no hay errores específicos, crear uno genérico
              if (!errors.length) {
                errors.push({
                  field: 'credentials',
                  errors: ['Las credenciales proporcionadas no son válidas'],
                  value: null,
                });
              }
            }
          } else if (typeof response === 'string') {
            message = response;

            // Si es un error simple, intentar proporcionar información más detallada
            if (error instanceof ConflictException) {
              const field = message.toLowerCase().includes('email')
                ? 'email'
                : message.toLowerCase().includes('username')
                  ? 'username'
                  : 'field';

              errors.push({
                field: field,
                errors: [message],
                value: null,
              });
            }
            // Si es un error de autenticación
            else if (error instanceof UnauthorizedException) {
              errors.push({
                field: 'credentials',
                errors: [
                  message || 'Las credenciales proporcionadas no son válidas',
                ],
                value: null,
              });
            } else {
              errors.push({
                field: 'general',
                errors: [message],
                value: null,
              });
            }
          }
        }

        // Crear respuesta de error estándar
        const errorResponse = new ErrorSerializer({
          statusCode,
          message,
          errors,
        });

        // Lanzar nueva excepción con formato estandarizado
        return throwError(() => new HttpException(errorResponse, statusCode));
      }),
    );
  }
}
