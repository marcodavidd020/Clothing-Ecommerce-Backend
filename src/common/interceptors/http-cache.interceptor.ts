import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Interceptor de caché HTTP personalizado
 * Extiende el CacheInterceptor de NestJS para añadir lógica personalizada
 *
 * Uso:
 * @UseInterceptors(HttpCacheInterceptor)
 */
@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  /**
   * Determina si una solicitud debe ser almacenada en caché
   */
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // No cachear si hay un token de autenticación (contenido personalizado)
    const hasAuthHeader = request.headers['authorization'];

    // No cachear peticiones no GET
    const isGetRequest = request.method === 'GET';

    // Verificar si la ruta está marcada como cacheable con metadatos
    const isCacheableRoute = super.isRequestCacheable(context);

    return isCacheableRoute && isGetRequest && !hasAuthHeader;
  }

  /**
   * Genera una clave de caché para la solicitud
   */
  trackBy(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest<Request>();
    const { url, query } = request;

    // Generar una clave basada en la URL y los parámetros de consulta
    return `${url}?${JSON.stringify(query)}`;
  }
}
