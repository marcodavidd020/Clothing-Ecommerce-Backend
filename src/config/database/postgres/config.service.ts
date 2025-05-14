import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class PostgresConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('postgres.host')!;
  }

  get port(): number {
    return this.configService.get<number>('postgres.port')!;
  }

  get username(): string {
    return this.configService.get<string>('postgres.username')!;
  }

  get password(): string {
    return this.configService.get<string>('postgres.password')!;
  }

  get database(): string {
    return this.configService.get<string>('postgres.database')!;
  }

  get schema(): string {
    return this.configService.get<string>('postgres.schema')!;
  }

  get synchronize(): boolean {
    return this.configService.get<boolean>('postgres.synchronize')!;
  }

  get logging(): boolean {
    return this.configService.get<boolean>('postgres.logging')!;
  }

  get ssl(): boolean {
    return this.configService.get<boolean>('postgres.ssl')!;
  }

  get autoLoadEntities(): boolean {
    return this.configService.get<boolean>('postgres.autoLoadEntities')!;
  }

  get maxConnections(): number {
    return this.configService.get<number>('postgres.maxConnections')!;
  }

  get connectionTimeout(): number {
    return this.configService.get<number>('postgres.connectionTimeout')!;
  }

  getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
      schema: this.schema,
      synchronize: this.synchronize,
      logging: this.logging,
      ssl: this.ssl,
      autoLoadEntities: this.autoLoadEntities,
      extra: {
        max: this.maxConnections,
        connectionTimeoutMillis: this.connectionTimeout,
      },
    };
  }
}
