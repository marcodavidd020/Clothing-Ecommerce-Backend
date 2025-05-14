import { Module } from '@nestjs/common';
import { RedisCacheProviderModule } from './cache/redis/provider.module';
import { PostgresProviderModule } from './database/postgres/provider.module';
import { RedisQueueProviderModule } from './queue/redis/provider.module';
import { SmtpMailProviderModule } from './mail/smtp/provider.module';

/**
 * Módulo de proveedores principal que encapsula todos los proveedores del sistema.
 * Dependiendo de tus necesidades, puedes importar solo los proveedores que necesites.
 */
@Module({
  imports: [
    // Proveedores de bases de datos
    PostgresProviderModule,
    // MongoProviderModule,
    // MySqlProviderModule,

    // Proveedor de caché
    RedisCacheProviderModule,

    // Proveedor de colas
    RedisQueueProviderModule,

    // Proveedor de correo
    SmtpMailProviderModule,
  ],
  exports: [
    PostgresProviderModule,
    // MongoProviderModule,
    // MySqlProviderModule,
    RedisCacheProviderModule,
    RedisQueueProviderModule,
    SmtpMailProviderModule,
  ],
})
export class ProvidersModule {}
