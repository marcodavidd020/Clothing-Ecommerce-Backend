import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para limitar el número de solicitudes por IP
 *
 * Implementa una protección básica contra ataques de fuerza bruta y DDoS
 * limitando el número de solicitudes que un cliente puede hacer en un período de tiempo.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requestRecords: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minuto
  private readonly maxRequests: number = 60; // 60 solicitudes por minuto

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Si es la primera solicitud para esta IP, inicializar el registro
    if (!this.requestRecords.has(ip)) {
      this.requestRecords.set(ip, [now]);
      return next();
    }

    // Obtener registro de solicitudes para esta IP
    const requests = this.requestRecords.get(ip) || [];

    // Filtrar solicitudes antiguas fuera de la ventana de tiempo
    const recentRequests = requests.filter(
      (time) => time > now - this.windowMs,
    );

    // Actualizar registro con solicitudes recientes
    this.requestRecords.set(ip, [...recentRequests, now]);

    // Verificar si se ha superado el límite
    if (recentRequests.length >= this.maxRequests) {
      // Calcular el tiempo restante hasta que se pueda realizar otra solicitud
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + this.windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000);

      // Establecer cabeceras de límite de tasa
      res.setHeader('Retry-After', String(waitTime));
      res.setHeader('X-RateLimit-Limit', String(this.maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

      // Devolver respuesta 429 (Demasiadas solicitudes)
      throw new HttpException(
        {
          success: false,
          message:
            'Demasiadas solicitudes, por favor intente de nuevo más tarde',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Establecer cabeceras de límite de tasa para solicitudes permitidas
    res.setHeader('X-RateLimit-Limit', String(this.maxRequests));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(this.maxRequests - recentRequests.length - 1),
    );

    next();
  }

  /**
   * Limpia registros antiguos cada cierto tiempo
   * Este método podría ser llamado periódicamente para evitar fugas de memoria
   */
  cleanupOldRecords() {
    const now = Date.now();
    for (const [ip, requests] of this.requestRecords.entries()) {
      const recentRequests = requests.filter(
        (time) => time > now - this.windowMs,
      );

      if (recentRequests.length === 0) {
        this.requestRecords.delete(ip);
      } else {
        this.requestRecords.set(ip, recentRequests);
      }
    }
  }
}
