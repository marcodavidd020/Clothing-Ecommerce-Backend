import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSeederModule } from './seeders/users/user.seeder.module';
import { AddressesSeederModule } from './seeders/addresses/addresses.seeder.module';
import { RolesSeederModule } from './seeders/roles/roles.seeder.module';
import { PermissionsSeederModule } from './seeders/permissions/permissionsseeder.module';
import { RolePermissionsSeederModule } from './seeders/roles/role-permissions.seeder.module';
import { UserRolesSeederModule } from './seeders/users/user-roles.seeder.module';
import { PostgresConfigModule } from '../config/database/postgres/config.module';
import { PostgresConfigService } from '../config/database/postgres/config.service';
import { CategoriesSeederModule } from './seeders/categories/categories.seeder.module';
import { ProductsSeederModule } from './seeders/products/products.seeder.module';
import { CartsSeederModule } from './seeders/carts/carts.seeder.module';
import { PaymentsSeederModule } from './seeders/payments/payments.seeder.module';
import { CouponsSeederModule } from './seeders/coupons/coupons.seeder.module';
import { UserCouponsSeederModule } from './seeders/user-coupons/user-cupons.seeder.module';
import { OrdersSeederModule } from './seeders/orders/orders.seeder.module';

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
    CartsSeederModule,
    PaymentsSeederModule,
    CouponsSeederModule,
    UserCouponsSeederModule,
    OrdersSeederModule,
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
    CartsSeederModule,
    PaymentsSeederModule,
    CouponsSeederModule,
    UserCouponsSeederModule,
    OrdersSeederModule,
  ],
})
export class DatabaseModule {}
