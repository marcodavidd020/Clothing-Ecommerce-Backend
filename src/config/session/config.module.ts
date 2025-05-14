import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { SessionConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ConfigService, SessionConfigService],
  exports: [ConfigService, SessionConfigService],
})
export class SessionConfigModule {}
