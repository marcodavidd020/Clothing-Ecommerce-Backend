# Documentación de Configuración del Sistema

## Introducción

Este documento describe la arquitectura de configuración implementada en el proyecto. Se utiliza un enfoque modular basado en los estándares de NestJS, que separa la configuración en diferentes módulos según su responsabilidad.

## Estructura de Carpetas

```
src/config
├── app                 # Configuración general de la aplicación
├── cache               # Configuración de caché (Redis)
├── database            # Configuración de conexiones a bases de datos
│   ├── mongo           # Configuración para MongoDB
│   ├── mysql           # Configuración para MySQL
│   └── postgres        # Configuración para PostgreSQL
├── queue               # Configuración de colas de mensajes
├── session             # Configuración de manejo de sesiones
└── storage             # Configuración de almacenamiento de archivos
```

## Módulos de Configuración

Cada módulo de configuración sigue la misma estructura:

- **configuration.ts**: Define las variables de configuración y sus valores por defecto.
- **config.service.ts**: Proporciona una interfaz tipada para acceder a la configuración.
- **config.module.ts**: Define el módulo NestJS para la configuración.

### Configuración de Aplicación

La configuración general de la aplicación incluye parámetros como:

- Entorno (development, production, test)
- Puerto de la aplicación
- Prefijo de API
- Configuraciones de idioma

```typescript
// Ejemplo de uso
import { AppConfigService } from './config/app/config.service';

// Inyectar en constructor
constructor(private appConfigService: AppConfigService) {}

// Uso
const port = this.appConfigService.port;
const apiPrefix = this.appConfigService.apiPrefix;
```

### Configuración de Base de Datos (PostgreSQL)

La configuración de PostgreSQL incluye todos los parámetros necesarios para la conexión:

- Host, puerto, usuario, contraseña
- Nombre de base de datos y esquema
- Opciones de sincronización y logging
- Configuraciones de conexión (timeout, máximas conexiones)

```typescript
// Ejemplo de uso
import { PostgresConfigService } from './config/database/postgres/config.service';

// Inyectar en constructor
constructor(private postgresConfigService: PostgresConfigService) {}

// Obtener configuración completa para TypeORM
const typeOrmConfig = this.postgresConfigService.getTypeOrmConfig();
```

### Configuración de Caché

Permite configurar el sistema de caché, por defecto configurado para Redis:

- Host y puerto de servidor Redis
- TTL (Time To Live) de los elementos en caché
- Límite máximo de elementos en caché
- Configuración global

```typescript
// Ejemplo de uso
import { CacheConfigService } from './config/cache/config.service';

// Inyectar en constructor
constructor(private cacheConfigService: CacheConfigService) {}

// Uso
const ttl = this.cacheConfigService.ttl;
```

### Configuración de Colas de Mensajes (Queue)

Este módulo gestiona la configuración para sistemas de colas de mensajes (como RabbitMQ o Bull):

- Conexión al servidor de colas
- Configuración de colas y canales
- Estrategias de reintentos
- Manejo de mensajes fallidos

```typescript
// Ejemplo de configuración para Queue
export default registerAs('queue', () => ({
  host: process.env.QUEUE_HOST || 'localhost',
  port: parseInt(process.env.QUEUE_PORT || '5672', 10),
  username: process.env.QUEUE_USERNAME || 'guest',
  password: process.env.QUEUE_PASSWORD || 'guest',
  retryAttempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000', 10),
  prefetchCount: parseInt(process.env.QUEUE_PREFETCH_COUNT || '10', 10),
}));
```

### Configuración de Sesiones

Gestiona las opciones de manejo de sesiones de usuario:

- Tipo de almacenamiento (memoria, Redis, base de datos)
- Tiempo de expiración
- Opciones de seguridad (httpOnly, secure)
- Nombre de la cookie y dominio

```typescript
// Ejemplo de configuración para Session
export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET || 'my-secret',
  resave: process.env.SESSION_RESAVE === 'true',
  saveUninitialized: process.env.SESSION_SAVE_UNINIT === 'true',
  cookie: {
    httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000', 10), // 1 día
  },
  store: {
    type: process.env.SESSION_STORE_TYPE || 'memory', // memory, redis, db
    host: process.env.SESSION_STORE_HOST,
    port: parseInt(process.env.SESSION_STORE_PORT || '6379', 10),
    ttl: parseInt(process.env.SESSION_STORE_TTL || '86400', 10),
  },
}));
```

### Configuración de Almacenamiento (Storage)

Define cómo se configuran los servicios de almacenamiento de archivos:

- Proveedor de almacenamiento (local, S3, Google Cloud Storage)
- Configuración de directorios y rutas
- Límites de tamaño de archivo
- Tipos de archivos permitidos

```typescript
// Ejemplo de configuración para Storage
export default registerAs('storage', () => ({
  provider: process.env.STORAGE_PROVIDER || 'local', // local, s3, gcs
  baseUrl: process.env.STORAGE_BASE_URL || 'http://localhost:3000/uploads',

  // Configuración Local
  localPath: process.env.STORAGE_LOCAL_PATH || 'uploads',

  // Configuración S3
  s3: {
    bucket: process.env.STORAGE_S3_BUCKET || 'my-bucket',
    region: process.env.STORAGE_S3_REGION || 'us-east-1',
    accessKey: process.env.STORAGE_S3_ACCESS_KEY,
    secretKey: process.env.STORAGE_S3_SECRET_KEY,
  },

  // Limitaciones generales
  maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '5242880', 10), // 5MB
  allowedMimeTypes: (
    process.env.STORAGE_ALLOWED_MIME_TYPES ||
    'image/jpeg,image/png,application/pdf'
  ).split(','),
}));
```

## Validación de Configuración

Todas las configuraciones son validadas utilizando Joi, lo que garantiza que los valores proporcionados son válidos:

```typescript
validationSchema: Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  // PostgreSQL
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  // ...más validaciones
}),
```

## Uso en Variables de Entorno

Para configurar el sistema, se pueden establecer variables de entorno en un archivo `.env`:

```sh
# App
NODE_ENV=development
PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=secretpassword

# Cache
CACHE_HOST=localhost
CACHE_PORT=6379

# Queue
QUEUE_HOST=localhost
QUEUE_PORT=5672

# Session
SESSION_SECRET=mi-clave-secreta
SESSION_COOKIE_MAX_AGE=86400000

# Storage
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=mi-bucket-produccion
```

## Implementación de Nuevos Módulos

Para implementar un nuevo módulo de configuración (por ejemplo, para un servicio externo), se debe seguir el patrón existente:

1. Crear los tres archivos base (configuration.ts, config.service.ts, config.module.ts)
2. Definir las variables y valores predeterminados
3. Implementar el servicio de configuración tipado
4. Añadir el módulo a la configuración principal (config.module.ts)
5. Actualizar el esquema de validación si es necesario

## Buenas Prácticas

1. Siempre proporcionar valores por defecto razonables para entornos de desarrollo
2. Documentar todas las variables de entorno en un archivo `.env.example`
3. No incluir contraseñas o secretos en el código fuente
4. Utilizar tipado estricto para capturar errores en tiempo de compilación
5. Encapsular la lógica de acceso a configuración en servicios específicos
6. Validar las variables de entorno al inicio de la aplicación

## Apéndice: Plantilla de .env.example

A continuación se presenta una plantilla completa para el archivo `.env.example` que incluye todas las variables de entorno configurables en el sistema:

```sh
# ==================================
# Configuración de la Aplicación
# ==================================
NODE_ENV=development
PORT=3000
APP_NAME=NestJS App
API_PREFIX=api
APP_FALLBACK_LANGUAGE=es
APP_HEADER_LANGUAGE=x-custom-lang

# ==================================
# Configuración de PostgreSQL
# ==================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres
POSTGRES_SCHEMA=public
POSTGRES_SYNCHRONIZE=false
POSTGRES_LOGGING=true
POSTGRES_SSL=false
POSTGRES_AUTO_LOAD_ENTITIES=true
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_CONNECTION_TIMEOUT=10000

# ==================================
# Configuración de Cache
# ==================================
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_TTL=5
CACHE_MAX=10
CACHE_IS_GLOBAL=true

# ==================================
# Configuración de Queue
# ==================================
QUEUE_HOST=localhost
QUEUE_PORT=5672
QUEUE_USERNAME=guest
QUEUE_PASSWORD=guest
QUEUE_VHOST=/
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000
QUEUE_PREFETCH_COUNT=10
QUEUE_DURABLE=true

# ==================================
# Configuración de Session
# ==================================
SESSION_SECRET=my-secret
SESSION_RESAVE=false
SESSION_SAVE_UNINIT=false
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_MAX_AGE=86400000
SESSION_COOKIE_SAME_SITE=lax
SESSION_STORE_TYPE=memory
SESSION_STORE_HOST=localhost
SESSION_STORE_PORT=6379
SESSION_STORE_TTL=86400
SESSION_STORE_DB=0
SESSION_STORE_PREFIX=sess:

# ==================================
# Configuración de Storage
# ==================================
STORAGE_PROVIDER=local
STORAGE_BASE_URL=http://localhost:3000/uploads
# Local Storage
STORAGE_LOCAL_PATH=uploads
STORAGE_LOCAL_SERVE_STATIC=true
# S3 Storage
STORAGE_S3_BUCKET=my-bucket
STORAGE_S3_REGION=us-east-1
STORAGE_S3_ACCESS_KEY=
STORAGE_S3_SECRET_KEY=
STORAGE_S3_ENDPOINT=
STORAGE_S3_FORCE_PATH_STYLE=false
# Google Cloud Storage
STORAGE_GCS_BUCKET=my-bucket
STORAGE_GCS_PROJECT_ID=
STORAGE_GCS_KEY_FILENAME=
# Limitaciones generales
STORAGE_MAX_FILE_SIZE=5242880
STORAGE_ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf
STORAGE_ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.pdf
```
