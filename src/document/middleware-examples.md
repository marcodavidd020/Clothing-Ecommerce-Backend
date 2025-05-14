# UserMiddleware: Análisis y Uso

## Estado Actual

Actualmente, el `UserMiddleware` está configurado en `AppModule` pero no se está utilizando efectivamente en la aplicación. El middleware está configurado para cargar los datos completos del usuario desde la base de datos cuando hay un usuario autenticado y almacenarlos en `req[CURRENT_USER_KEY]`.

### Configuración en AppModule

```typescript
// En app.module.ts
consumer
  .apply(UserMiddleware)
  .forRoutes(
    { path: 'users', method: RequestMethod.ALL },
    { path: 'profile', method: RequestMethod.ALL }
  );
```

### Implementación del Middleware

```typescript
// En user.middleware.ts
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

## Problema Identificado

Existen varios problemas con la implementación actual:

1. **No se accede a los datos**: Aunque el middleware carga el usuario en `req[CURRENT_USER_KEY]`, no hay ningún controlador que esté utilizando esta información directamente mediante `@Req()`.

2. **Rutas incorrectas**: El middleware está aplicado a las rutas `users` y `profile`, pero no a la ruta `auth/profile` donde realmente se obtiene el perfil del usuario.

3. **Duplicación**: El controlador `AuthController` ya obtiene los datos del usuario utilizando `@LoggedInUser()` y llamando a `authService.getProfile(user.id)`, lo que hace redundante el middleware.

## Soluciones Propuestas

### Opción 1: Ajustar las rutas del middleware

Si queremos mantener el middleware, debemos asegurarnos de que se aplique a las rutas correctas:

```typescript
// En app.module.ts
consumer
  .apply(UserMiddleware)
  .forRoutes(
    { path: 'auth/profile', method: RequestMethod.ALL },
    { path: 'auth/refresh-token', method: RequestMethod.ALL },
    { path: 'users', method: RequestMethod.ALL },
    { path: 'addresses/:id/default', method: RequestMethod.PUT }
  );
```

### Opción 2: Crear un decorador personalizado

Podemos crear un decorador `@CurrentUser()` que aproveche los datos cargados por el middleware:

```typescript
// En logged-in-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request[CURRENT_USER_KEY]; // Obtener usuario del middleware

    // Si el middleware no ha cargado el usuario, usar el del token JWT
    if (!user && request.user) {
      return data ? request.user?.[data] : request.user;
    }

    // Si se especifica una propiedad, devolver solo esa propiedad
    return data ? user?.[data] : user;
  },
);
```

### Opción 3: Modificar los controladores

Podemos modificar los controladores para utilizar el objeto `req` y acceder a los datos cargados por el middleware:

```typescript
// En auth.controller.ts
@Get('profile')
async getProfile(@Req() req, @LoggedInUser() user: IJwtUser): Promise<any> {
  // Usar datos del middleware si están disponibles
  const completeUser = req[CURRENT_USER_KEY] || await this.authService.getProfile(user.id);
  return createSuccessResponse(
    new UserSerializer(completeUser),
    'Perfil recuperado exitosamente'
  );
}
```

### Opción 4: Remover el middleware (Recomendada)

Si los controladores ya están obteniendo los datos del usuario directamente mediante servicios, podemos considerar eliminar el middleware para evitar consultas duplicadas a la base de datos:

```typescript
// En app.module.ts - Eliminar estas líneas
consumer
  .apply(UserMiddleware)
  .forRoutes(
    { path: 'users', method: RequestMethod.ALL },
    { path: 'profile', method: RequestMethod.ALL }
  );
```

## Análisis de Impacto

### Rendimiento
El middleware actual realiza una consulta a la base de datos para cada solicitud autenticada, incluso cuando los datos no se utilizan. Esto puede afectar el rendimiento.

### Mantenibilidad
Tener dos formas diferentes de obtener los datos del usuario (mediante middleware y mediante `@LoggedInUser()`) puede dificultar el mantenimiento del código.

### Claridad del Código
El enfoque actual crea confusión sobre cómo se deben obtener los datos del usuario (a través del middleware o directamente mediante servicios).

## Recomendación Final

**Opción 4**: Remover el middleware y estandarizar el uso del decorador `@LoggedInUser()` junto con los servicios correspondientes para obtener los datos completos del usuario cuando sea necesario.

Esta solución:
- Elimina consultas innecesarias a la base de datos
- Simplifica el flujo de autenticación
- Mantiene un enfoque consistente en toda la aplicación
- Evita la duplicación de código y responsabilidades 