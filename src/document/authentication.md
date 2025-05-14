# Sistema de Autenticación

El sistema de autenticación implementa un flujo completo basado en JWT (JSON Web Tokens) para la gestión segura de identidades.

## Arquitectura

El sistema implementa una arquitectura de autenticación basada en tokens con los siguientes componentes:

- **JWT Strategy**: Implementación personalizada de Passport para validación de tokens
- **Guards**: Protección de rutas basada en autenticación y roles
- **Decoradores**: Para extraer información del usuario actual y definir restricciones de acceso
- **Serialización**: Transformación segura de respuestas para eliminar datos sensibles
- **Refresh Tokens**: Sistema completo para renovar el acceso sin requerir credenciales

## Estructura de Directorios

```
authentication/
├── dto/                    # Data Transfer Objects
│   ├── login.dto.ts        # Validación de datos de login
│   └── refresh-token.dto.ts # Validación para renovar tokens
├── interfaces/             # Interfaces de datos
│   ├── jwt-payload.interface.ts  # Estructura del payload JWT
│   ├── jwt-user.interface.ts     # Usuario autenticado
│   ├── login.interface.ts        # Credenciales de login
│   ├── refresh-token.interface.ts # Estructura del refresh token
│   └── token.interface.ts        # Estructura de tokens
├── serializers/            # Serializadores
│   └── token.serializer.ts # Respuesta serializada de tokens
├── auth.controller.ts      # Endpoints de autenticación
├── auth.module.ts          # Configuración del módulo
├── auth.service.ts         # Servicios de autenticación
└── jwt.strategy.ts         # Estrategia de autenticación
```

## Flujo de Autenticación

1. El cliente envía credenciales (email/password) a `/auth/login`
2. El sistema valida las credenciales contra la base de datos
3. Si son válidas, genera un par de tokens:
   - Access Token JWT: Vida corta (1h por defecto)
   - Refresh Token: Vida larga (7d por defecto)
4. El cliente almacena ambos tokens y utiliza el access token en cabeceras Authorization
5. Cuando el access token expira, el cliente utiliza el refresh token para obtener un nuevo par de tokens
6. Los endpoints protegidos verifican la validez del token usando JwtAuthGuard
7. El payload decodificado se adjunta a la solicitud como `req.user`

## Endpoints

| Método | Ruta           | Descripción                  | Datos de entrada           | Respuesta                        |
|--------|----------------|------------------------------|----------------------------|----------------------------------|
| POST   | /auth/login    | Login y generación de tokens | `{ email, password }`      | `{ accessToken, refreshToken, expiresIn, tokenType }` |
| POST   | /auth/refresh  | Renovar tokens               | `{ refreshToken }`         | `{ accessToken, refreshToken, expiresIn, tokenType }` |
| GET    | /auth/profile  | Obtener perfil del usuario   | Token JWT (Authorization)  | Datos del usuario sin campos sensibles |

## Configuración

La configuración del sistema JWT se realiza en `config/auth/jwt/`:

```typescript
// Valores configurables
JWT_SECRET=mi_clave_secreta_super_segura
JWT_EXPIRES_IN=1h  // Formato: 1h, 7d, 60m, etc.
REFRESH_TOKEN_SECRET=otra_clave_secreta_diferente
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Seguridad

El sistema implementa varias capas de seguridad:

- Contraseñas almacenadas con hash bcrypt (no en texto plano)
- Tokens JWT con tiempo de expiración configurable
- Validación de usuario activo en cada solicitud autenticada
- Payload mínimo en tokens para reducir exposición de datos
- Refresh tokens seguros almacenados con hash en la base de datos
- Invalidación de refresh tokens al utilizarlos o cambiar contraseña

## Refresh Tokens

El sistema de refresh tokens proporciona:

1. **Mejor experiencia de usuario**: Los usuarios no necesitan iniciar sesión frecuentemente
2. **Mayor seguridad**: Los access tokens tienen una vida corta, minimizando el riesgo si son comprometidos
3. **Revocación**: Los refresh tokens pueden ser revocados en caso de compromiso de seguridad

### Funcionamiento del sistema de refresh tokens:

1. Al iniciar sesión, el usuario recibe un access token y un refresh token
2. Cuando el access token expira, el cliente envía el refresh token a `/auth/refresh`
3. Si el refresh token es válido, se genera un nuevo par de tokens
4. El refresh token utilizado queda invalidado para prevenir reutilización

## Uso en Controladores

### Proteger una Ruta

```typescript
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('recursos')
export class RecursosController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getRecursos() {
    // Solo accesible para usuarios autenticados
    return [...];
  }
}
```

### Obtener Usuario Actual

```typescript
import { LoggedInUser } from '../common/decorators/requests/logged-in-user.decorator';
import { IJwtUser } from '../authentication/interfaces/jwt-user.interface';

@Get('mi-perfil')
@UseGuards(JwtAuthGuard)
getProfile(@LoggedInUser() user: IJwtUser) {
  // user contiene { id, email, roles }
  return this.service.getProfileData(user.id);
}
```

### Restringir por Roles

```typescript
import { UserTypes } from '../common/decorators/metadata/user-types.decorator';
import { UserTypesGuard } from '../common/guards/user-types.guard';

@Get('admin/estadisticas')
@UserTypes('admin', 'super_admin')
@UseGuards(JwtAuthGuard, UserTypesGuard)
getAdminStats() {
  // Solo accesible para usuarios con rol 'admin' o 'super_admin'
  return this.statsService.getAdminStatistics();
}
```

## Extensibilidad

El sistema está diseñado para ser extensible:

- Se puede agregar soporte para refresh tokens añadiendo los endpoints correspondientes
- Es posible implementar autenticación con proveedores externos (OAuth, OIDC) mediante estrategias adicionales
- La estructura permite añadir funcionalidades como bloqueo de cuenta tras intentos fallidos 