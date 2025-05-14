# Módulo de Autenticación

## Descripción

Este módulo gestiona todo lo relacionado con la autenticación y autorización de usuarios en la plataforma de ecommerce.

## Endpoints principales

### Registro de usuarios

`POST /auth/register`

Permite a un nuevo usuario registrarse en el sistema.

**Uso típico:** Un nuevo cliente se registra proporcionando su email, nombre, apellido y contraseña.

### Inicio de sesión

`POST /auth/login`

Autentica a un usuario y devuelve un token JWT para acceder a las funciones protegidas.

**Uso típico:** Un usuario existente inicia sesión para hacer compras o gestionar su cuenta.

### Perfil de usuario

`GET /auth/profile`

Obtiene la información del perfil del usuario autenticado.

**Uso típico:** Un usuario quiere ver o editar sus datos personales.

### Renovar token

`POST /auth/refresh`

Permite renovar un token JWT antes de que expire.

**Uso típico:** La aplicación cliente renueva automáticamente el token cuando está a punto de expirar.

## Consideraciones de seguridad

- Los tokens JWT tienen un tiempo de expiración configurable (por defecto 1 hora)
- Las contraseñas se validan según criterios de seguridad (mínimo 6 caracteres)
- Los intentos fallidos de inicio de sesión se pueden limitar para prevenir ataques de fuerza bruta
