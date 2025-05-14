import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('cache.host')!;
  }

  get port(): number {
    return this.configService.get<number>('cache.port')!;
  }

  get ttl(): number {
    return this.configService.get<number>('cache.ttl')!;
  }

  get max(): number {
    return this.configService.get<number>('cache.max')!;
  }

  get isGlobal(): boolean {
    return this.configService.get<boolean>('cache.isGlobal')!;
  }
}
