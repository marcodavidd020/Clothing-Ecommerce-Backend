# Uso de Middleware y Helpers en NestJS

En esta documentación, explicaremos dónde y cómo se aplican los Middleware (especialmente `UserMiddleware`) y los Helpers en nuestra aplicación NestJS.

## Middleware

Los middleware son funciones que se ejecutan durante el ciclo de solicitud-respuesta, antes de que la solicitud llegue al controlador.

### 1. Configuración de Middleware

En NestJS, los middleware se configuran típicamente en el módulo principal (`AppModule`) o en módulos específicos implementando la interfaz `NestModule`:

```typescript
// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UserMiddleware } from './common/middleware/models/user.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        { path: 'profile', method: RequestMethod.ALL }
      );
  }
}
```

### 2. UserMiddleware

El `UserMiddleware` es especialmente útil para rutas autenticadas. Su función principal es:

1. Extraer el ID de usuario del objeto `req['user']` (que fue establecido por el Guard JWT)
2. Cargar los datos completos del usuario desde la base de datos
3. Almacenar estos datos en la solicitud para su uso posterior

```typescript
// src/common/middleware/models/user.middleware.ts
@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (req['user'] && req['user'].id) {
        const userId = req['user'].id;
        const user = await this.usersService.findById(userId);
        req[CURRENT_USER_KEY] = user;
      }
    } catch (error) {
      console.error('Error en UserMiddleware:', error.message);
    }
    next();
  }
}
```

### 3. Acceso a los datos en controladores

Una vez que el `UserMiddleware` ha ejecutado, los datos completos del usuario están disponibles en cualquier controlador mediante:

```typescript
import { CURRENT_USER_KEY } from '../common/constants/settings';

@Get()
someEndpoint(@Req() req: Request) {
  const user = req[CURRENT_USER_KEY]; // Usuario completo cargado por el middleware
  // ...
}
```

También podemos acceder a los datos básicos del token JWT usando el decorador `@LoggedInUser()`:

```typescript
@Get('profile')
getProfile(@LoggedInUser() user: IJwtUser) {
  return this.authService.getProfile(user.id);
}
```

## Helpers

Los helpers son funciones utilitarias que proporcionan funcionalidad reutilizable. A diferencia de los middleware, no están vinculados al ciclo de solicitud-respuesta.

### 1. Helpers de respuestas

Estos helpers se utilizan principalmente en controladores para estandarizar las respuestas API:

```typescript
// src/models/users/users.controller.ts
@Get()
async findAll(): Promise<any> {
  const users = await this.usersService.findAll();
  return createSuccessResponse(
    users.map((user) => new UserSerializer(user)),
    'Usuarios recuperados exitosamente'
  );
}

@Post()
async create(@Body() userData: CreateUserDto): Promise<any> {
  try {
    const user = await this.usersService.create(userData);
    return createCreatedResponse(new UserSerializer(user), 'Usuario');
  } catch (error) {
    throw new ConflictException(
      createErrorResponse('Error al crear el usuario.')
    );
  }
}
```

### 2. Helpers de manipulación de strings

Estos helpers se pueden usar en cualquier parte de la aplicación para manipular strings:

```typescript
// Ejemplo de uso de slugify y capitalize
@Post()
async create(@Body() userData: CreateUserDto): Promise<any> {
  // Crear un nombre de usuario a partir del email
  const username = slugify(userData.email.split('@')[0]);
  
  // Capitalizar el nombre
  const formattedName = capitalize(userData.firstName);
  
  // ...
}
```

### 3. Helpers de excepciones

Se utilizan para crear respuestas de error estandarizadas:

```typescript
@Get(':id')
async findById(@Param('id') id: string): Promise<any> {
  const user = await this.usersService.findById(id);
  if (!user) {
    throw new NotFoundException(
      createNotFoundResponse('Usuario')
    );
  }
  return createSuccessResponse(new UserSerializer(user));
}

@Post('login')
async login(@Body() loginDto: LoginDto): Promise<any> {
  try {
    // ...
  } catch (error) {
    throw new UnauthorizedException(
      createUnauthorizedResponse('Credenciales incorrectas')
    );
  }
}
```

## Evitando la Redundancia en las Respuestas

Un problema común al trabajar con interceptores y helpers de respuesta es la redundancia. Por ejemplo, si usamos `createSuccessResponse()` en un controlador y también tenemos configurado el `ResponseTransformInterceptor`, obtendríamos una respuesta anidada:

```json
{
  "success": true,
  "message": "Operación completada con éxito",
  "data": {
    "success": true,
    "message": "Usuarios recuperados exitosamente",
    "data": [...],
    "timestamp": "..."
  },
  "timestamp": "..."
}
```

### Solución implementada

Para evitar esta redundancia, hemos modificado el `ResponseTransformInterceptor` para que detecte si la respuesta ya tiene el formato estándar:

```typescript
// En ResponseTransformInterceptor
map((data) => {
  // Si ya es un SuccessSerializer, no transformar
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
    return data; // No transformar, ya tiene el formato correcto
  }

  // Envolver la respuesta en SuccessSerializer
  return new SuccessSerializer({
    message: 'Operación completada con éxito',
    data: data,
  });
})
```

Con esta modificación, se puede usar `createSuccessResponse()` en los controladores sin duplicar la estructura en la respuesta final.

### Recomendaciones de uso

1. **Enfoque coherente**: Elige usar *o bien* el interceptor *o bien* los helpers, pero no ambos para la misma respuesta
2. **Mejor práctica**: Usa `ResponseTransformInterceptor` a nivel global y evita usar los helpers de respuesta en los controladores
3. **Alternativa**: Si prefieres el control detallado, usa los helpers y desactiva el interceptor para esos controladores

## Resumen

- **UserMiddleware**: Se aplica en el `AppModule` para las rutas autenticadas y carga datos del usuario completo
- **Helpers de respuestas**: Se utilizan en controladores para estandarizar la estructura de las respuestas API
- **Helpers de strings**: Se utilizan para manipulación de cadenas de texto en cualquier parte de la aplicación
- **Helpers de excepciones**: Se utilizan para crear mensajes de error estandarizados
- **ResponseTransformInterceptor**: Detecta inteligentemente respuestas ya formateadas para evitar redundancia

Esta combinación de middleware y helpers proporciona una estructura coherente y reutilizable para toda la aplicación. 