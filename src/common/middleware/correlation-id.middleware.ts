import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware para añadir un ID de correlación para seguimiento
 *
 * Este middleware asigna un ID único a cada solicitud y respuesta,
 * facilitando el seguimiento de una solicitud a través de microservicios
 * y para propósitos de registro y depuración.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly CORRELATION_ID_HEADER = 'X-Correlation-ID';

  use(req: Request, res: Response, next: NextFunction) {
    // Intentar obtener el ID de correlación de la cabecera
    let correlationId = req.headers[
      this.CORRELATION_ID_HEADER.toLowerCase()
    ] as string;

    // Si no existe, generar uno nuevo
    if (!correlationId) {
      correlationId = uuidv4();
      req.headers[this.CORRELATION_ID_HEADER.toLowerCase()] = correlationId;
    }

    // Establecer el ID de correlación en la respuesta
    res.setHeader(this.CORRELATION_ID_HEADER, correlationId);

    // Añadir el ID al objeto de solicitud para uso interno
    req['correlationId'] = correlationId;

    next();
  }
}
