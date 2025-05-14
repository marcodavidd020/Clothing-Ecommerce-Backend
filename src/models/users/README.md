# Módulo de Usuarios

Este módulo gestiona todas las operaciones relacionadas con usuarios, incluyendo CRUD completo y validaciones.

## Características

- Gestión completa de usuarios (crear, leer, actualizar, eliminar)
- Validación de datos con DTO y decoradores personalizados
- Encriptación de contraseñas
- Validación de emails únicos
- Serialización de respuestas

## Estructura de directorios

```
models/users/
├── dto/              # Objetos de transferencia de datos
├── entities/         # Entidades de base de datos
├── interfaces/       # Interfaces y tipos
├── repositories/     # Repositorios para acceso a datos
├── serializers/      # Transformadores de respuesta
├── users.controller.ts # Controlador REST
├── users.module.ts     # Definición del módulo
└── users.service.ts    # Lógica de negocio
```

## Entidad User

La entidad `User` incluye los siguientes campos:

- `id`: UUID único
- `email`: Email único del usuario
- `firstName`: Nombre
- `lastName`: Apellido
- `password`: Contraseña (almacenada con hash)
- `isActive`: Estado del usuario
- `avatar`: URL de imagen de perfil
- `roles`: Roles del usuario para control de acceso
- `phoneNumber`: Número de teléfono (opcional)
- `addresses`: Relación con direcciones
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

## DTOs

- `CreateUserDto`: Validación para creación de usuarios
  - Incluye validaciones de email único, longitud mínima, etc.
- `UpdateUserDto`: Validación para actualización de usuarios
  - Todos los campos son opcionales

## Endpoints

| Método | Ruta        | Descripción                      | Autenticación |
|--------|-------------|----------------------------------|---------------|
| GET    | /users      | Obtiene lista de usuarios        | No            |
| GET    | /users/:id  | Obtiene un usuario por ID        | No            |
| POST   | /users      | Crea un nuevo usuario            | No            |
| PUT    | /users/:id  | Actualiza un usuario existente   | No            |
| DELETE | /users/:id  | Elimina un usuario               | No            |

## Validaciones personalizadas

Este módulo utiliza validadores personalizados:

- `@UniqueUserEmail()`: Verifica que el email no exista en la base de datos
- `@UserExists()`: Verifica que un ID de usuario referenciado existe

## Ejemplo de uso

```typescript
// Crear un usuario nuevo
const newUser = {
  email: 'usuario@ejemplo.com',
  firstName: 'Nombre',
  lastName: 'Apellido',
  password: 'contraseña123',
  roles: ['user']
};

// POST /users
// La respuesta omitirá el campo 'password' por seguridad
```

## Seguridad

- Las contraseñas se almacenan con hash usando bcrypt
- El campo `password` nunca se incluye en las respuestas (select: false)
- Validación de datos de entrada para prevenir inyección

## Dependencias

El módulo depende de:

- `common/decorators/validations`: Para validaciones personalizadas
- `models/common/repositories`: Para el repositorio base 