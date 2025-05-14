import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { CacheConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ConfigService, CacheConfigService],
  exports: [ConfigService, CacheConfigService],
})
export class CacheConfigModule {}
