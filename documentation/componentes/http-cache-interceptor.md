# Interceptor de Caché HTTP (HttpCacheInterceptor)

El `HttpCacheInterceptor` es un componente clave para mejorar el rendimiento de la API mediante el almacenamiento en caché de respuestas. Este interceptor extiende la funcionalidad del `CacheInterceptor` integrado en NestJS, añadiendo lógica personalizada para un control más preciso sobre lo que se almacena en caché.

## Características Principales

- **Almacenamiento selectivo**: Solo cachea respuestas bajo condiciones específicas
- **Integración con Redis**: Utiliza Redis como almacén de caché distribuido
- **Claves de caché personalizadas**: Genera claves únicas basadas en la URL y parámetros
- **Exclusión de contenido personalizado**: Evita cachear respuestas que dependen del usuario

## Funcionamiento

### Reglas de Caché

El interceptor aplica las siguientes reglas para determinar si una respuesta debe almacenarse en caché:

1. **Solo solicitudes GET**: Las peticiones POST, PUT, DELETE, etc., nunca se almacenan en caché
2. **Sin autenticación**: Las solicitudes con token de autenticación no se cachean para evitar mezclar datos entre usuarios
3. **Rutas explícitamente marcadas**: Solo se cachean las rutas que están decoradas con metadatos adecuados

```typescript
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
```

### Generación de Claves de Caché

El interceptor genera claves únicas para cada combinación de URL y parámetros de consulta:

```typescript
trackBy(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<Request>();
  const { url, query } = request;

  // Generar una clave basada en la URL y los parámetros de consulta
  return `${url}?${JSON.stringify(query)}`;
}
```

## Configuración del Caché

El sistema utiliza Redis como almacén de caché con la siguiente configuración:

```typescript
CacheModule.registerAsync({
  imports: [CacheConfigModule],
  inject: [CacheConfigService],
  useFactory: async (cacheConfigService: CacheConfigService) => ({
    store: redisStore,
    host: cacheConfigService.host,
    port: cacheConfigService.port,
    ttl: cacheConfigService.ttl, // Tiempo de vida en segundos
    max: cacheConfigService.max, // Número máximo de elementos
    isGlobal: cacheConfigService.isGlobal,
  }),
  isGlobal: true,
});
```

## Casos de Uso Recomendados

El `HttpCacheInterceptor` es ideal para:

### 1. Datos Relativamente Estáticos

- Catálogos de productos
- Listas de categorías
- Información de referencia (países, idiomas, etc.)
- Contenido que no cambia frecuentemente

### 2. Operaciones Costosas

- Consultas complejas a bases de datos
- Agregaciones y cálculos intensivos
- Datos que requieren múltiples peticiones a servicios externos

### 3. Información Pública

- Contenido disponible sin autenticación
- Datos que son iguales para todos los usuarios
- Páginas de inicio y vistas generales

## Cómo Utilizarlo

Puedes aplicar el interceptor de dos formas:

### A Nivel de Controlador

```typescript
import { Controller, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@UseInterceptors(HttpCacheInterceptor)
@Controller('productos')
export class ProductosController {
  // Todos los endpoints en este controlador utilizarán caché

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }
}
```

### A Nivel de Método (Endpoint Específico)

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@Controller('productos')
export class ProductosController {
  // Solo el método findAll utilizará caché
  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  // Este método no utilizará caché
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }
}
```

### Uso con Metadatos Adicionales (TTL Personalizado)

```typescript
import {
  Controller,
  Get,
  UseInterceptors,
  CacheKey,
  CacheTTL,
} from '@nestjs/common';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@Controller('productos')
export class ProductosController {
  // Configuración personalizada de caché
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey('productos_populares') // Clave personalizada
  @CacheTTL(3600) // TTL de 1 hora en segundos
  @Get('populares')
  findPopulares() {
    return this.productosService.findPopulares();
  }
}
```

## Beneficios de Usar el HttpCacheInterceptor

1. **Mejor Rendimiento**: Reduce significativamente los tiempos de respuesta para consultas repetidas
2. **Menor Carga en la Base de Datos**: Disminuye el número de consultas a la base de datos
3. **Mayor Escalabilidad**: Permite que tu aplicación maneje más tráfico con los mismos recursos
4. **Mejor Experiencia de Usuario**: Respuestas más rápidas para los clientes de la API
5. **Ahorro de Recursos**: Reduce el consumo de CPU, memoria y ancho de banda

## Consideraciones Importantes

- **Invalidación de Caché**: Implementa estrategias para invalidar el caché cuando los datos cambien
- **TTL Adecuado**: Configura el tiempo de vida según la volatilidad de los datos
- **Monitoreo**: Observa métricas de Redis para optimizar el uso del caché
- **Pruebas**: Verifica que los datos cacheados se actualizan correctamente cuando es necesario

## Implementación Técnica

El interceptor extiende el `CacheInterceptor` de NestJS, sobrescribiendo dos métodos clave:

1. `isRequestCacheable`: Determina si una solicitud debe cachearse
2. `trackBy`: Genera la clave única para cada solicitud

La configuración se realiza a través del módulo `RedisCacheProviderModule` que configura Redis como almacén de caché.

## Ejemplo Completo

```typescript
// controllers/categorias.controller.ts
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';
import { CategoriasService } from '../services/categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Este endpoint utiliza caché
  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  async findAll() {
    return this.categoriasService.findAll();
  }

  // Este endpoint también utiliza caché pero con TTL personalizado
  @UseInterceptors(HttpCacheInterceptor)
  @CacheTTL(86400) // 24 horas
  @Get('destacadas')
  async findDestacadas() {
    return this.categoriasService.findDestacadas();
  }
}
```
