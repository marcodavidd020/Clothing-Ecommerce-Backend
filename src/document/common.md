# Componentes Comunes (Common)

El módulo `common` proporciona componentes reutilizables que siguen el principio DRY (Don't Repeat Yourself) y permiten mantener consistencia en toda la aplicación.

## Arquitectura

El módulo implementa una arquitectura de capas con los siguientes componentes:

- **Decoradores**: Permiten añadir metadatos y funcionalidad a clases y métodos
- **Guards**: Controlan el acceso a rutas basado en condiciones
- **Interceptores**: Modifican las respuestas y peticiones
- **Pipes**: Validan y transforman datos
- **Helpers**: Funciones utilitarias para tareas comunes
- **Serializadores**: Transforman entidades en respuestas API
- **Middleware**: Procesan solicitudes antes de llegar a los controladores
- **Paginación**: Sistema completo para respuestas paginadas en la API

## Estructura de Directorios

```
common/
├── constants/                 # Constantes globales
│   └── settings.ts           # Configuración compartida
├── decorators/                # Decoradores personalizados
│   ├── metadata/             # Para metadatos
│   │   └── user-types.decorator.ts
│   ├── requests/             # Para peticiones HTTP
│   │   └── logged-in-user.decorator.ts
│   └── validations/          # Para validación de datos
│       ├── UniqueUserEmail.ts
│       └── UserExists.ts
├── exceptions/                # Manejo de excepciones
│   └── http-exception.filter.ts
├── guards/                    # Protección de rutas
│   ├── jwt-auth.guard.ts
│   └── user-types.guard.ts
├── helpers/                   # Funciones auxiliares
│   ├── exceptions/           # Formateo de excepciones
│   │   └── validation.helper.ts
│   ├── responses/            # Formateo de respuestas
│   │   ├── error.helper.ts
│   │   ├── success.helper.ts
│   │   └── pagination.helper.ts # Helpers para respuestas paginadas
│   └── string.helper.ts      # Manipulación de strings
├── interfaces/                # Interfaces comunes
│   ├── inputs.interface.ts   # Para parametrización
│   ├── search.interface.ts   # Para resultados paginados
│   ├── paginated-result.interface.ts # Para resultados paginados
│   └── pagination-options.interface.ts # Para opciones de paginación
├── interceptors/              # Interceptores
│   └── http-cache.interceptor.ts
├── middleware/                # Middleware
│   └── models/               # Específico para modelos
│       └── user.middleware.ts
├── pipes/                     # Pipes de validación
│   └── validation.pipe.ts
└── serializers/               # Transformadores de respuesta
    ├── model.serializer.ts    # Base para modelos
    ├── responses/            # Para respuestas API
    │   ├── error.serializer.ts
    │   └── success.serializer.ts
    └── validation/           # Para errores de validación
        └── validation-error.serializer.ts
```

## Componentes Principales

### Guards

| Guard | Descripción | Parámetros |
|-------|-------------|------------|
| `JwtAuthGuard` | Verifica autenticación mediante token JWT | Ninguno |
| `UserTypesGuard` | Verifica roles de usuario para acceso | Roles requeridos mediante `@UserTypes()` |

### Decoradores

| Decorador | Descripción | Parámetros | Ejemplo |
|-----------|-------------|------------|---------|
| `@UserTypes()` | Define roles permitidos | `...roles: string[]` | `@UserTypes('admin', 'editor')` |
| `@LoggedInUser()` | Obtiene usuario actual | `data?: string` (propiedad) | `@LoggedInUser() user` o `@LoggedInUser('id') userId` |
| `@UniqueUserEmail()` | Valida email único | `validationOptions?: ValidationOptions` | `@UniqueUserEmail() email: string` |
| `@UserExists()` | Valida existencia de usuario | `validationOptions?: ValidationOptions` | `@UserExists() userId: string` |

### Helpers de Respuesta

Los helpers son funciones de utilidad que pueden ser utilizadas en cualquier parte de la aplicación. No tienen una relación directa con los pipes, ya que cumplen propósitos diferentes:

- **Helpers**: Proporcionan funciones auxiliares para tareas comunes, como formateo de respuestas o manipulación de strings.
- **Pipes**: Se enfocan en la validación y transformación de datos durante el ciclo de vida de las peticiones.

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `createSuccessResponse()` | Crea respuesta de éxito | `data: any, message?: string` |
| `createCreatedResponse()` | Respuesta para creación | `data: any, entityName?: string` |
| `createUpdatedResponse()` | Respuesta para actualización | `data: any, entityName?: string` |
| `createDeletedResponse()` | Respuesta para eliminación | `entityName?: string` |
| `createErrorResponse()` | Crea respuesta de error | `message?: string, statusCode?: number, errors?: any[]` |
| `createNotFoundResponse()` | Error 404 | `entityName?: string` |
| `createUnauthorizedResponse()` | Error 401 | `message?: string` |
| `createForbiddenResponse()` | Error 403 | `message?: string` |

### Helpers de Paginación

| Función | Descripción | Parámetros |
|---------|-------------|------------|
| `createPaginatedResponse()` | Crea respuesta paginada | `entities: any[], totalItems: number, options: PaginationOptions` |
| `getPaginationMetadata()` | Genera metadatos de paginación | `totalItems: number, options: PaginationOptions` |
| `calculateTotalPages()` | Calcula el número total de páginas | `totalItems: number, limit: number` |

#### Interfaces de Paginación

El sistema incluye las siguientes interfaces para trabajar con datos paginados:

```typescript
// Opciones de paginación para las consultas
export interface PaginationOptions {
  page: number;
  limit: number;
  route?: string;
}

// Estructura de resultado paginado
export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

#### Dónde utilizar los Helpers

Los helpers se utilizan principalmente en:

1. **Controladores**: Para formatear respuestas HTTP de forma consistente
2. **Servicios**: Para generar mensajes de error estandarizados
3. **Excepciones personalizadas**: Para mantener un formato de error consistente
4. **Interceptores**: Para transformar respuestas antes de enviarlas al cliente
5. **Repositorios**: Para estandarizar resultados paginados

### Helpers de String

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `slugify()` | Convierte texto a formato URL | `slugify('Hola Mundo') // 'hola-mundo'` |
| `capitalize()` | Capitaliza primera letra | `capitalize('hola') // 'Hola'` |
| `kebabToCamel()` | Convierte kebab-case a camelCase | `kebabToCamel('user-name') // 'userName'` |
| `camelToKebab()` | Convierte camelCase a kebab-case | `camelToKebab('userName') // 'user-name'` |
| `stripHtml()` | Elimina etiquetas HTML | `stripHtml('<p>Texto</p>') // 'Texto'` |
| `truncate()` | Acorta texto a longitud máxima | `truncate('Texto largo', 5) // 'Texto...'` |

### Interceptores

| Interceptor | Descripción | Uso |
|-------------|-------------|-----|
| `HttpCacheInterceptor` | Caché inteligente para respuestas GET. Mejora el rendimiento almacenando respuestas en Redis. Solo cachea peticiones sin autenticación y rutas marcadas explícitamente. [Documentación detallada](./http-cache-interceptor.md) | `@UseInterceptors(HttpCacheInterceptor)` |
| `ResponseTransformInterceptor` | Transforma todas las respuestas a un formato estándar usando SuccessSerializer y ErrorSerializer | `@UseInterceptors(ResponseTransformInterceptor)` |

### Pipes

Los pipes se utilizan para transformar y validar datos entrantes. El `ValidationPipe` personalizado extiende la funcionalidad del pipe estándar de NestJS para proporcionar mensajes de error más detallados.

| Pipe | Descripción | Uso |
|------|-------------|-----|
| `ValidationPipe` | Validación avanzada de datos con errores formateados según el estándar de la aplicación | Global o `@UsePipes(ValidationPipe)` |

### Middleware

El middleware procesa las solicitudes antes de que lleguen a los controladores. Algunos ejemplos de middleware que podrían implementarse en esta estructura son:

| Middleware | Descripción | Uso |
|------------|-------------|-----|
| `UserMiddleware` | Carga datos del usuario actual en la solicitud | Rutas que requieren contexto de usuario |
| `LoggingMiddleware` | Registra información sobre solicitudes HTTP | Global o para rutas específicas |
| `RateLimitMiddleware` | Limita el número de solicitudes por IP | Rutas públicas susceptibles a abusos |
| `CorrelationIdMiddleware` | Añade un ID de correlación para seguimiento | Global para todas las rutas |

## Constantes Importantes

Definidas en `constants/settings.ts`:

| Constante | Tipo | Descripción |
|-----------|------|-------------|
| `USER_TYPES_KEY` | string | Clave para metadatos de roles |
| `CURRENT_USER_KEY` | string | Identificador del usuario en solicitud |
| `CACHE_TTL` | number | Tiempo de vida del caché (segundos) |
| `DEFAULT_PAGE_SIZE` | number | Tamaño predeterminado de página |
| `MAX_PAGE_SIZE` | number | Tamaño máximo de página |
| `ERROR_MESSAGES` | object | Mensajes de error estandarizados |

## Serializadores

| Serializador | Descripción | Campos expuestos |
|--------------|-------------|------------------|
| `ModelSerializer` | Base para modelos | `id`, `createdAt`, `updatedAt` |
| `SuccessSerializer` | Respuestas exitosas | `success`, `message`, `data`, `timestamp` |
| `ErrorSerializer` | Respuestas de error | `success`, `message`, `statusCode`, `errors`, `timestamp` |
| `ValidationErrorSerializer` | Errores de validación | Como `ErrorSerializer` + errores detallados |

## Ejemplos de Uso

### Protección y Roles

```typescript
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserTypesGuard } from '../common/guards/user-types.guard';
import { UserTypes } from '../common/decorators/metadata/user-types.decorator';

@Controller('articulos')
export class ArticulosController {
  // Ruta protegida - solo usuarios autenticados
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() { ... }

  // Ruta protegida con roles - solo administradores
  @UserTypes('admin')
  @UseGuards(JwtAuthGuard, UserTypesGuard)
  @Post()
  create() { ... }
}
```

### Acceso al Usuario Actual

```typescript
import { LoggedInUser } from '../common/decorators/requests/logged-in-user.decorator';
import { IJwtUser } from '../authentication/interfaces/jwt-user.interface';

@Get('perfil')
@UseGuards(JwtAuthGuard)
getMyProfile(@LoggedInUser() user: IJwtUser) {
  return this.usersService.findById(user.id);
}

// Solo acceder al ID
@Get('mis-compras')
@UseGuards(JwtAuthGuard)
getMyOrders(@LoggedInUser('id') userId: string) {
  return this.ordersService.findByUserId(userId);
}
```

### Respuestas Formateadas

```typescript
import { createSuccessResponse, createCreatedResponse } from '../common/helpers/responses/success.helper';
import { createNotFoundResponse } from '../common/helpers/responses/error.helper';

@Get(':id')
async findOne(@Param('id') id: string) {
  const entity = await this.service.findById(id);
  if (!entity) {
    throw new NotFoundException(
      createNotFoundResponse('Artículo')
    );
  }
  return createSuccessResponse(entity);
}

@Post()
async create(@Body() data) {
  const created = await this.service.create(data);
  return createCreatedResponse(created, 'Artículo');
}
```

### Paginación de Resultados

```typescript
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { createPaginatedResponse } from '../common/helpers/responses/pagination.helper';

@Get()
async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
  const options: PaginationOptions = { page, limit };
  const { items, totalItems } = await this.service.findPaginated(options);
  
  return createPaginatedResponse(items, totalItems, options);
}
```

### Búsqueda con Paginación

```typescript
@Get('search')
async search(
  @Query('q') query: string,
  @Query('page') page = 1,
  @Query('limit') limit = 10,
) {
  const options: PaginationOptions = { page, limit };
  const { items, totalItems } = await this.service.search(query, options);
  
  return createPaginatedResponse(items, totalItems, options);
}
```

### Validación de Datos

```typescript
import { UniqueUserEmail } from '../common/decorators/validations/UniqueUserEmail';

export class CreateUserDto {
  @IsEmail()
  @UniqueUserEmail()
  email: string;
  
  // Otras propiedades...
}
``` 