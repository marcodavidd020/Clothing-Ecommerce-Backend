import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para registrar información sobre solicitudes HTTP
 *
 * Registra detalles como:
 * - Método HTTP
 * - URL
 * - IP del cliente
 * - Tiempo de respuesta
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Registrar la solicitud entrante
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    // Capturar el evento 'finish' para registrar la respuesta
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;
      const statusColorCode = this.getStatusColorCode(statusCode);

      console.log(
        `[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusColorCode}${statusCode}\x1b[0m - ${responseTime}ms`,
      );
    });

    next();
  }

  /**
   * Obtiene el código de color ANSI para el código de estado HTTP
   */
  private getStatusColorCode(status: number): string {
    if (status >= 500) {
      return '\x1b[31m'; // Rojo para errores del servidor
    }
    if (status >= 400) {
      return '\x1b[33m'; // Amarillo para errores del cliente
    }
    if (status >= 300) {
      return '\x1b[36m'; // Cian para redirecciones
    }
    if (status >= 200) {
      return '\x1b[32m'; // Verde para éxito
    }
    return '\x1b[0m'; // Sin color
  }
}
