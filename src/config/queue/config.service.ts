import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('queue.host')!;
  }

  get port(): number {
    return this.configService.get<number>('queue.port')!;
  }

  get username(): string {
    return this.configService.get<string>('queue.username')!;
  }

  get password(): string {
    return this.configService.get<string>('queue.password')!;
  }

  get vhost(): string {
    return this.configService.get<string>('queue.vhost')!;
  }

  get retryAttempts(): number {
    return this.configService.get<number>('queue.retryAttempts')!;
  }

  get retryDelay(): number {
    return this.configService.get<number>('queue.retryDelay')!;
  }

  get prefetchCount(): number {
    return this.configService.get<number>('queue.prefetchCount')!;
  }

  get queueOptions(): any {
    return this.configService.get<any>('queue.queueOptions')!;
  }

  getRabbitMQConfig() {
    return {
      hostname: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      vhost: this.vhost,
    };
  }
}
