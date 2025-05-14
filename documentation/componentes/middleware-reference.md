# Referencia de Middleware en NestJS

Los middleware son funciones que se ejecutan antes de que llegue la solicitud al controlador, permitiendo procesar y modificar la solicitud y respuesta.

## Middleware Disponibles

### 1. CorrelationIdMiddleware

Añade un ID de correlación único a cada solicitud y respuesta para facilitar el seguimiento y la depuración.

```typescript
// Uso en un módulo principal
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*'); // Para todas las rutas
  }
}
```

### 2. LoggingMiddleware

Registra información detallada sobre las solicitudes HTTP, incluyendo el tiempo de respuesta y los códigos de estado.

```typescript
// Uso en un módulo
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from '../common/middleware/logging.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*'); // Para todas las rutas
  }
}
```

### 3. RateLimitMiddleware

Limita el número de solicitudes que un cliente puede hacer en un período de tiempo específico para prevenir ataques de fuerza bruta y DDoS.

```typescript
// Uso en un módulo
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { RateLimitMiddleware } from '../common/middleware/rate-limit.middleware';

@Module({})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('auth/login', 'auth/register'); // Solo rutas sensibles
  }
}
```

## Uso Avanzado

### Aplicar Múltiples Middleware

Puedes aplicar varios middleware en secuencia:

```typescript
consumer.apply(CorrelationIdMiddleware, LoggingMiddleware).forRoutes('*');
```

### Excluir Rutas

Puedes excluir rutas específicas:

```typescript
consumer
  .apply(RateLimitMiddleware)
  .exclude(
    { path: 'health', method: RequestMethod.GET },
    { path: 'metrics', method: RequestMethod.GET },
  )
  .forRoutes('*');
```

### Middleware Condicional

Para aplicar middleware de forma condicional:

```typescript
export class ConditionalMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (someCondition) {
      // Lógica cuando se cumple la condición
    } else {
      // Lógica alternativa
    }
    next();
  }
}
```

## Integración en la Aplicación Principal

Para usar todos los middleware en tu aplicación, integra en el `AppModule`:

```typescript
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    // Tus módulos
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware global para todas las rutas
    consumer.apply(CorrelationIdMiddleware, LoggingMiddleware).forRoutes('*');

    // Middleware de límite de tasa para rutas sensibles
    consumer
      .apply(RateLimitMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
      )
      .forRoutes('auth', 'api');
  }
}
```
