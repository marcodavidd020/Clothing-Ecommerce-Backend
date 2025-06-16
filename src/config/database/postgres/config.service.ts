import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

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

  get ssl(): boolean | object {
    const sslEnabled = this.configService.get<boolean>('postgres.ssl');
    if (!sslEnabled) return false;
    
    // In production/serverless environment, use CA certificate
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      try {
        // Try to read the CA certificate file
        const caPath = path.join(process.cwd(), 'certs', 'ca.pem');
        if (fs.existsSync(caPath)) {
          const ca = fs.readFileSync(caPath, 'utf8');
          return {
            rejectUnauthorized: true,
            ca: ca,
          };
        }
      } catch (error) {
        console.warn('Could not read CA certificate, falling back to relaxed SSL:', error.message);
      }
      
      // Fallback for production without CA file
      return {
        rejectUnauthorized: false,
      };
    }
    
    return sslEnabled;
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
