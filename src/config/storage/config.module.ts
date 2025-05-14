import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { StorageConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ConfigService, StorageConfigService],
  exports: [ConfigService, StorageConfigService],
})
export class StorageConfigModule {}
