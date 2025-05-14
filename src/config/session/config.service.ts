import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>('session.secret')!;
  }

  get resave(): boolean {
    return this.configService.get<boolean>('session.resave')!;
  }

  get saveUninitialized(): boolean {
    return this.configService.get<boolean>('session.saveUninitialized')!;
  }

  get cookie(): any {
    return this.configService.get<any>('session.cookie')!;
  }

  get store(): any {
    return this.configService.get<any>('session.store')!;
  }

  getStoreConfig() {
    const storeConfig = this.store;

    switch (storeConfig.type) {
      case 'redis':
        return {
          host: storeConfig.host,
          port: storeConfig.port,
          ttl: storeConfig.ttl,
          db: storeConfig.db,
          prefix: storeConfig.prefix,
        };
      case 'db':
        return {
          // Configuración para base de datos
          type: 'database',
          tableName: 'sessions',
          ttl: storeConfig.ttl,
        };
      case 'memory':
      default:
        return {
          type: 'memory',
        };
    }
  }

  getSessionConfig() {
    return {
      secret: this.secret,
      resave: this.resave,
      saveUninitialized: this.saveUninitialized,
      cookie: this.cookie,
    };
  }
}
