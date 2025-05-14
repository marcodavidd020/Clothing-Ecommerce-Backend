# Middleware específicos para modelos (legacy)

Este directorio contenía middleware específicos para modelos, como el `UserMiddleware`, pero han sido reemplazados por una implementación más eficiente.

## UserMiddleware (Removido)

El `UserMiddleware` fue diseñado para cargar datos completos del usuario desde la base de datos en cada solicitud autenticada y almacenarlos en `req[CURRENT_USER_KEY]`.

### Problemas identificados:

1. **Consultas innecesarias**: El middleware realizaba consultas a la base de datos para cada solicitud autenticada, aunque no siempre se usaban los datos.
2. **Duplicación**: Los controladores ya obtenían los datos del usuario directamente mediante sus servicios correspondientes.
3. **No se utilizaba**: Ningún controlador accedía a `req[CURRENT_USER_KEY]`, haciendo que las consultas fueran completamente innecesarias.

### Solución implementada:

Hemos estandarizado el acceso a los datos del usuario mediante:

1. **Uso del decorador `@LoggedInUser()`**: Permite acceder a los datos básicos del usuario desde el token JWT.
2. **Llamada explícita a servicios**: Cuando se necesitan datos completos del usuario, se llama directamente al método correspondiente del servicio.

## Ver alternativas

Si necesitas acceder a los datos completos del usuario en muchos lugares, considera implementar un decorador personalizado:

```typescript
export const CurrentUser = createParamDecorator(
  async (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // Inyectar el UsersService
    const usersService = request.app.get(UsersService);
    const completeUser = await usersService.findById(user.id);

    // Si se especifica una propiedad, devolver solo esa propiedad
    return data ? completeUser?.[data] : completeUser;
  },
);
```

Este enfoque es más eficiente porque solo carga los datos cuando se necesitan.
