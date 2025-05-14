# Estructura General del Proyecto NestJS

## Organización de Capas

El proyecto está organizado en varias capas, cada una con responsabilidades específicas:

### 1. Configuración (`/config`)
Contiene los valores de configuración para diferentes aspectos del sistema:
- App (general)
- Cache (redis)
- Database (postgres, mysql, mongo)
- Queue (bull)
- Session (redis)
- Storage (filesystem, s3)
- CORS (configuración de acceso cruzado)

### 2. Proveedores (`/providers`)
Implementa los proveedores que crean conexiones a servicios externos:
- Cache (redis)
- Database (postgres, mysql, mongo)
- Mail (smtp)
- Queue (redis)

### 3. Modelos (`/models`)
Define las entidades del dominio y su lógica de negocio:
- Entidades (typeorm)
- Repositorios
- Servicios
- Controladores
- Serializadores
- DTOs (Data Transfer Objects)
- Interfaces

### 4. Database (`/database`)
Gestión de migraciones y datos iniciales:
- Migraciones
- Factories
- Seeders

### 5. Common (`/common`)
Componentes reutilizables a lo largo de la aplicación:
- Helpers (paginación, respuestas, etc.)
- Interfaces (resultados paginados, opciones de búsqueda)
- Decoradores
- Guards
- Interceptores

## Estructura de Archivos

```
src/
├── config/           # Configuración
│   ├── app/
│   ├── cache/
│   ├── database/
│   ├── queue/
│   ├── session/
│   ├── storage/
│   └── cors/         # Configuración de CORS
│
├── providers/        # Proveedores
│   ├── cache/
│   ├── database/
│   ├── mail/
│   └── queue/
│
├── models/           # Modelos
│   ├── common/
│   │   ├── repositories/
│   │   │   └── base.repository.ts  # Repositorio base con paginación
│   │   └── serializers/
│   ├── users/
│   │   ├── controllers/
│   │   │   └── users.controller.ts  # Incluye endpoints de búsqueda
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── search-user.dto.ts   # DTO para búsqueda
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── interfaces/
│   │   │   └── search-user-options.interface.ts
│   │   ├── repositories/
│   │   │   └── users.repository.ts  # Implementa métodos de búsqueda
│   │   ├── services/
│   │   │   └── users.service.ts
│   │   └── users.module.ts
│   ├── addresses/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── addresses.module.ts
│   └── index.ts
│
├── authentication/   # Autenticación
│   ├── controllers/
│   │   └── auth.controller.ts   # Incluye endpoint de refresh token
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── refresh-token.dto.ts # DTO para refresh token
│   ├── interfaces/
│   │   ├── jwt-payload.interface.ts
│   │   ├── jwt-user.interface.ts
│   │   └── refresh-token.interface.ts # Interfaz para refresh tokens
│   ├── services/
│   │   └── auth.service.ts      # Implementa lógica de refresh tokens
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── auth.module.ts
│
├── common/           # Componentes comunes
│   ├── helpers/
│   │   ├── responses/
│   │   │   ├── success.helper.ts
│   │   │   ├── error.helper.ts
│   │   │   └── pagination.helper.ts # Helpers para respuestas paginadas
│   ├── interfaces/
│   │   ├── pagination-options.interface.ts # Opciones de paginación
│   │   └── paginated-result.interface.ts   # Estructura de resultados paginados
│   ├── decorators/
│   ├── guards/
│   └── interceptors/
│
├── database/         # Base de datos
│   ├── migrations/
│   ├── factories/
│   └── seeders/
│
└── document/         # Documentación
    ├── configuracion-sistema.md
    ├── providers-estructura.md
    ├── database-estructura.md
    ├── authentication.md
    ├── common.md
    └── estructura-general.md (este archivo)
```

## Principios de Arquitectura

- **Modularidad**: Cada componente está encapsulado en módulos NestJS
- **Separación de Responsabilidades**: Cada capa tiene una responsabilidad clara
- **Inyección de Dependencias**: Uso del sistema de DI de NestJS
- **Configuración Centralizada**: Valores de configuración en un solo lugar
- **Reutilización**: Patrones comunes abstraídos en clases base

## Estructura de Paginación

La paginación sigue un patrón consistente a través de la aplicación:

1. **Interfaces**: Definidas en `common/interfaces/` para estandarizar la estructura
2. **Repository**: El repositorio base en `models/common/repositories/base.repository.ts` implementa métodos genéricos para paginación
3. **Service**: Los servicios extienden la funcionalidad del repositorio
4. **Controller**: Los controladores utilizan query params estándar (`page` y `limit`)
5. **Response**: Estructura de respuesta unificada con metadatos de paginación

## Sistema de Búsqueda

El sistema de búsqueda se implementa de manera consistente:

1. **DTOs**: Cada entidad que soporta búsqueda tiene un DTO específico
2. **Endpoint**: Ruta estándar `/search` con query params (`q`, `page`, `limit`)
3. **Repositorio**: Implementación de QueryBuilder para búsqueda en múltiples campos
4. **Respuesta**: Formato de respuesta paginada consistente

## Sistema de Autenticación y Tokens

La autenticación implementa un flujo completo basado en tokens:

1. **Login**: Genera tokens de acceso y refresh token
2. **Refresh**: Permite renovar tokens sin requerir credenciales
3. **Guards**: Protección de rutas basada en tokens y roles
4. **Decoradores**: Acceso simplificado al usuario autenticado 