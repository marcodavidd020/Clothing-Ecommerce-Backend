import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSeederModule } from './seeders/users/seeder.module';
import { AddressesSeederModule } from './seeders/addresses/seeder.module';
import { RolesSeederModule } from './seeders/roles/seeder.module';
import { PermissionsSeederModule } from './seeders/permissions/seeder.module';
import { RolePermissionsSeederModule } from './seeders/roles/role-permissions.seeder.module';
import { UserRolesSeederModule } from './seeders/users/user-roles.seeder.module';
import { PostgresConfigModule } from '../config/database/postgres/config.module';
import { PostgresConfigService } from '../config/database/postgres/config.service';
import { CategoriesSeederModule } from './seeders/categories/seeder.module';
import { ProductsSeederModule } from './seeders/products/products.seeder.module';

/**
 * Módulo de base de datos
 *
 * Este módulo centraliza:
 * 1. Conexión a la base de datos (usando la configuración de /config/database)
 * 2. Migraciones (estructura de tablas)
 * 3. Seeders (datos iniciales)
 *
 * La configuración de la conexión se gestiona desde /config/database
 * Los proveedores específicos se manejan desde /providers/database
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [PostgresConfigModule],
      inject: [PostgresConfigService],
      useFactory: (dbConfigService: PostgresConfigService) => ({
        ...dbConfigService.getTypeOrmConfig(),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        synchronize: false,
        logging: ['error', 'migration', 'warn'],
      }),
    }),
    UsersSeederModule,
    AddressesSeederModule,
    RolesSeederModule,
    PermissionsSeederModule,
    RolePermissionsSeederModule,
    UserRolesSeederModule,
    CategoriesSeederModule,
    ProductsSeederModule,
  ],
  exports: [
    UsersSeederModule,
    AddressesSeederModule,
    RolesSeederModule,
    PermissionsSeederModule,
    RolePermissionsSeederModule,
    UserRolesSeederModule,
    CategoriesSeederModule,
    ProductsSeederModule,
  ],
})
export class DatabaseModule {}
