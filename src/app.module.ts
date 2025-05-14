import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ProvidersModule } from './providers/providers.module';
import { ModelsModule } from './models/models.module';
import { AuthModule } from './authentication/auth.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [ConfigModule, ProvidersModule, ModelsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Middleware global para todas las rutas
    consumer.apply(CorrelationIdMiddleware, LoggingMiddleware).forRoutes('*');

    // Middleware de límite de tasa para rutas sensibles
    consumer
      .apply(RateLimitMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
      )
      .forRoutes('auth', 'api');
  }
}
