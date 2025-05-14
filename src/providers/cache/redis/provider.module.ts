import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheConfigModule } from '../../../config/cache/config.module';
import { CacheConfigService } from '../../../config/cache/config.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [CacheConfigModule],
      inject: [CacheConfigService],
      useFactory: async (cacheConfigService: CacheConfigService) => ({
        store: redisStore,
        host: cacheConfigService.host,
        port: cacheConfigService.port,
        ttl: cacheConfigService.ttl,
        max: cacheConfigService.max,
        isGlobal: cacheConfigService.isGlobal,
      }),
      isGlobal: true,
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheProviderModule {}
