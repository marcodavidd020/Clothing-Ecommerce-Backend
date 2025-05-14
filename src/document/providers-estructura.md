# Documentación de Proveedores

## Introducción

Los proveedores en esta arquitectura son los componentes responsables de establecer las conexiones entre la aplicación y los diferentes servicios externos o motores de base de datos, cachés, colas, etc. Cada proveedor encapsula la lógica de conexión y configuración específica de un servicio.

## Estructura de Carpetas

```
src/providers
├── cache               # Proveedores de caché
│   └── redis           # Implementación con Redis
│       └── provider.module.ts
├── database            # Proveedores de bases de datos
│   ├── mongo           # MongoDB
│   │   └── provider.module.ts
│   ├── mysql           # MySQL
│   │   └── provider.module.ts
│   └── postgres        # PostgreSQL
│       └── provider.module.ts
├── mail                # Proveedores de correo electrónico
│   └── smtp            # Implementación SMTP
│       └── provider.module.ts
├── queue               # Proveedores de colas de mensajes
│   └── redis           # Implementación con Redis (Bull)
│       └── provider.module.ts
└── providers.module.ts # Módulo principal de proveedores
```

## Proveedores Implementados

### Base de Datos

#### PostgreSQL

El proveedor de PostgreSQL utiliza TypeORM para conectarse y gestionar la base de datos. Toma su configuración del módulo de configuración correspondiente.

```typescript
// Ejemplo de uso
import { PostgresProviderModule } from './providers/database/postgres/provider.module';

// Importar en tu módulo
@Module({
  imports: [PostgresProviderModule],
})
export class YourModule {}

// Usar el repositorio en un servicio
@Injectable()
export class YourService {
  constructor(
    @InjectRepository(YourEntity)
    private readonly yourRepository: Repository<YourEntity>,
  ) {}
}
```

#### MongoDB

El proveedor de MongoDB utiliza Mongoose para conectarse y gestionar la base de datos NoSQL.

```typescript
// Ejemplo de uso
import { MongoProviderModule } from './providers/database/mongo/provider.module';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Importar en tu módulo
@Module({
  imports: [MongoProviderModule],
})
export class YourModule {}

// Usar el modelo en un servicio
@Injectable()
export class YourService {
  constructor(
    @InjectModel(YourModel.name)
    private readonly yourModel: Model<YourModel>,
  ) {}
}
```

#### MySQL

El proveedor de MySQL también utiliza TypeORM, similar a PostgreSQL pero con la configuración específica para MySQL.

### Caché

#### Redis Cache

El proveedor de caché Redis utiliza @nestjs/cache-manager con el adaptador redis-store.

```typescript
// Ejemplo de uso
import { RedisCacheProviderModule } from './providers/cache/redis/provider.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// Importar en tu módulo
@Module({
  imports: [RedisCacheProviderModule],
})
export class YourModule {}

// Usar el cache en un servicio
@Injectable()
export class YourService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getItem(key: string): Promise<any> {
    // Intentar obtener datos de caché
    let item = await this.cacheManager.get(key);
    
    if (!item) {
      // Si no está en caché, obtenerlo de su fuente original
      item = await this.fetchItemFromSource(key);
      
      // Almacenar en caché para futuras peticiones
      await this.cacheManager.set(key, item);
    }
    
    return item;
  }
}
```

### Cola de Mensajes

#### Redis Queue (Bull)

El proveedor de colas utiliza Bull sobre Redis para gestionar colas de trabajos.

```typescript
// Ejemplo de uso
import { RedisQueueProviderModule } from './providers/queue/redis/provider.module';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

// Definir un procesador de colas
@Processor('your-queue')
export class YourQueueProcessor {
  @Process('your-job')
  async process(job: Job<any>) {
    // Procesar el trabajo
  }
}

// Importar en tu módulo
@Module({
  imports: [
    RedisQueueProviderModule,
    BullModule.registerQueue({
      name: 'your-queue',
    }),
  ],
  providers: [YourQueueProcessor],
})
export class YourModule {}

// Usar la cola en un servicio
@Injectable()
export class YourService {
  constructor(
    @InjectQueue('your-queue')
    private readonly yourQueue: Queue,
  ) {}

  async addJob(data: any) {
    await this.yourQueue.add('your-job', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
```

### Correo Electrónico

#### SMTP

El proveedor de correo electrónico utiliza @nestjs-modules/mailer para enviar emails a través de SMTP.

```typescript
// Ejemplo de uso
import { SmtpMailProviderModule } from './providers/mail/smtp/provider.module';
import { MailerService } from '@nestjs-modules/mailer';

// Importar en tu módulo
@Module({
  imports: [SmtpMailProviderModule],
})
export class YourModule {}

// Usar el servicio de correo
@Injectable()
export class YourService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendWelcomeEmail(user: any) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: '¡Bienvenido a nuestra plataforma!',
      template: 'welcome', // Usar una plantilla Handlebars
      context: { // Variables para la plantilla
        name: user.name,
        activationLink: `https://example.com/activate?token=${user.activationToken}`,
      },
    });
  }
}
```

## Módulo Principal de Proveedores

El archivo `providers.module.ts` actúa como punto de entrada para todos los proveedores. Este módulo importa y exporta todos los proveedores individuales, lo que permite que otros módulos de la aplicación utilicen cualquiera de los proveedores simplemente importando `ProvidersModule`.

Por defecto, algunos proveedores están comentados para evitar la carga innecesaria de servicios que podrían no ser utilizados en la aplicación:

```typescript
@Module({
  imports: [
    // Proveedores de bases de datos
    PostgresProviderModule,
    // MongoProviderModule, // Comentado para no cargar si no se usa
    // MySqlProviderModule, // Comentado para no cargar si no se usa
    
    // Otros proveedores...
  ],
  exports: [
    // Exportación de los proveedores...
  ],
})
export class ProvidersModule {}
```

## Uso en la Aplicación

Para utilizar los proveedores en la aplicación, simplemente se debe importar el módulo `ProvidersModule` en el módulo principal de la aplicación o en cualquier otro módulo donde se necesiten los servicios:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Adición de Nuevos Proveedores

Para añadir un nuevo proveedor:

1. Crear una nueva carpeta dentro de la estructura según el tipo de proveedor
2. Implementar el módulo del proveedor siguiendo el patrón de los existentes
3. Asegurarse de que utilice la configuración correspondiente si existe
4. Añadir el nuevo proveedor al módulo principal `ProvidersModule`

## Consideraciones de Rendimiento

Es importante tener en cuenta que cada proveedor puede consumir recursos del sistema, especialmente en términos de conexiones a servicios externos. Por lo tanto, se recomienda:

1. Cargar solo los proveedores que realmente se necesitan
2. Configurar adecuadamente los parámetros de conexión (timeout, pooling, etc.)
3. Implementar mecanismos de reconexión y manejo de errores

## Pruebas

Para facilitar las pruebas, es posible crear versiones mock de los proveedores que puedan ser utilizadas en los tests:

```typescript
// Ejemplo de un módulo de proveedor mock para pruebas
@Module({
  providers: [
    {
      provide: CACHE_MANAGER,
      useValue: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      },
    },
  ],
  exports: [CACHE_MANAGER],
})
export class MockRedisCacheProviderModule {}
``` 