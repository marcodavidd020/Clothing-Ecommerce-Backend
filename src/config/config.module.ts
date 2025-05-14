import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigModule } from './app/config.module';
import { CacheConfigModule } from './cache/config.module';
import { DatabaseModule } from './database/database.module';
import { QueueConfigModule } from './queue/config.module';
import { SessionConfigModule } from './session/config.module';
import { StorageConfigModule } from './storage/config.module';
import * as Joi from 'joi';
import { PostgresConfigModule } from './database/postgres/config.module';
import { JwtConfigModule } from './auth/jwt/config.module';

/**
 * Módulo de configuración centralizado
 *
 * Aquí se integran todos los submódulos de configuración:
 * - Base de datos
 * - Cache
 * - Queue
 * - Auth (JWT)
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PostgresConfigModule,
    JwtConfigModule,
    AppConfigModule,
    CacheConfigModule,
    DatabaseModule,
    QueueConfigModule,
    SessionConfigModule,
    StorageConfigModule,
  ],
  exports: [
    PostgresConfigModule,
    JwtConfigModule,
    AppConfigModule,
    CacheConfigModule,
    DatabaseModule,
    QueueConfigModule,
    SessionConfigModule,
    StorageConfigModule,
  ],
})
export class ConfigModule {}
