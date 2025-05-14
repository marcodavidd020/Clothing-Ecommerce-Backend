import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('app.nodeEnv')!;
  }

  get name(): string {
    return this.configService.get<string>('app.name')!;
  }

  get port(): number {
    return this.configService.get<number>('app.port')!;
  }

  get apiPrefix(): string {
    return this.configService.get<string>('app.apiPrefix')!;
  }

  get fallbackLanguage(): string {
    return this.configService.get<string>('app.fallbackLanguage')!;
  }

  get headerLanguage(): string {
    return this.configService.get<string>('app.headerLanguage')!;
  }
}
