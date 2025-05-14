# Módulos principales del API de Ecommerce

## Módulo de Usuarios

El módulo de usuarios gestiona toda la información relacionada con los usuarios del sistema, incluyendo clientes y administradores.

### Funcionalidades principales

- Registro de usuarios
- Administración de perfiles
- Consulta y búsqueda de usuarios
- Gestión de direcciones de usuarios

### Componentes clave

- `UsersController`: Gestiona los endpoints relacionados con usuarios
- `UsersService`: Implementa la lógica de negocio para operaciones con usuarios
- `UsersRepository`: Maneja el acceso a datos de usuarios en la base de datos
- `UserSerializer`: Define cómo se presentan los datos de usuarios en la API

## Módulo de Autenticación

Este módulo se encarga de la autenticación y autorización en la plataforma.

### Funcionalidades principales

- Inicio de sesión con JWT
- Registro de usuarios
- Renovación de tokens
- Verificación de permisos

### Componentes clave

- `AuthController`: Puntos de entrada para login, registro y tokens
- `AuthService`: Lógica para validar credenciales y generar tokens
- `JwtStrategy`: Estrategia de autenticación con JWT
- `PermissionsGuard`: Guard para verificar permisos basados en roles

## Módulo de Roles y Permisos

Gestiona los roles y permisos que determinan qué operaciones pueden realizar los usuarios en la plataforma.

### Funcionalidades principales

- Definición de roles (admin, staff, cliente, etc.)
- Asignación de permisos a roles
- Verificación de permisos en tiempo de ejecución

### Componentes clave

- `RolesController`: Endpoints para gestionar roles
- `RolesService`: Lógica para administrar roles y sus permisos
- `PermissionsController`: Endpoints para gestionar permisos
- `PermissionsService`: Lógica para administrar permisos individuales

## Módulo de Productos (Planificado)

Este módulo gestionará el catálogo de productos de la plataforma de ecommerce.

### Funcionalidades previstas

- CRUD de productos
- Categorización de productos
- Gestión de inventario
- Búsqueda y filtrado avanzado

## Módulo de Carrito (Planificado)

Responsable de gestionar el carrito de compras de los usuarios.

### Funcionalidades previstas

- Agregar/remover productos del carrito
- Actualizar cantidades
- Aplicar cupones y descuentos
- Guardar carrito para compra posterior

## Módulo de Pedidos (Planificado)

Gestionará los pedidos realizados por los usuarios.

### Funcionalidades previstas

- Creación de pedidos
- Seguimiento del estado
- Historial de pedidos
- Facturación

## Módulo de Pagos (Planificado)

Integrará diferentes métodos de pago para procesar las transacciones.

### Funcionalidades previstas

- Integración con pasarelas de pago
- Procesamiento de pagos con tarjeta
- Gestión de reembolsos
- Registros de transacciones
