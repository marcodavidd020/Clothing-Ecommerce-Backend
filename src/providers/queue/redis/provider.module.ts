import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueConfigModule } from '../../../config/queue/config.module';
import { QueueConfigService } from '../../../config/queue/config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [QueueConfigModule],
      inject: [QueueConfigService],
      useFactory: (queueConfigService: QueueConfigService) => ({
        redis: {
          host: queueConfigService.host,
          port: queueConfigService.port,
          password: queueConfigService.password,
        },
        defaultJobOptions: {
          attempts: queueConfigService.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: queueConfigService.retryDelay,
          },
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class RedisQueueProviderModule {}
