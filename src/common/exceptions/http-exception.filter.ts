import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro de excepciones HTTP para formatear respuestas de error
 *
 * Uso:
 * @UseFilters(HttpExceptionFilter)
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Obtener la respuesta del error
    const errorResponse = exception.getResponse();

    // Formatear la respuesta
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(typeof errorResponse === 'object'
        ? errorResponse
        : { message: errorResponse }),
    };

    // Loguear el error (solo errores de servidor, no los de cliente)
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    }

    // Responder con el error formateado
    response.status(status).json(responseBody);
  }
}
