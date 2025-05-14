import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { QueueConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ConfigService, QueueConfigService],
  exports: [ConfigService, QueueConfigService],
})
export class QueueConfigModule {}
