import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigModule } from './postgres/config.module';
import { PostgresConfigService } from './postgres/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [PostgresConfigModule],
      inject: [PostgresConfigService],
      useFactory: (postgresConfigService: PostgresConfigService) =>
        postgresConfigService.getTypeOrmConfig(),
    }),
    PostgresConfigModule,
  ],
  exports: [TypeOrmModule, PostgresConfigModule],
})
export class DatabaseModule {}
