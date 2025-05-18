import { NestFactory } from '@nestjs/core';
import { UsersSeederService } from './seeders/users/user.seeder.service';
import { AddressesSeederService } from './seeders/addresses/addresses.seeder.service';
import { RolesSeeder } from './seeders/roles/roles.seeder.service';
import { PermissionsSeeder } from './seeders/permissions/permissions.seeder.service';
import { RolePermissionsSeeder } from './seeders/roles/role-permissions.seeder.service';
import { UserRolesSeeder } from './seeders/users/user-roles.seeder.service';
import { DatabaseModule } from './database.module';
import { Logger } from '@nestjs/common';
import { CategoriesSeederService } from './seeders/categories/categories.seeder.service';
import { ProductsSeederService } from './seeders/products/products.seeder.service';
import { CartsSeederService } from './seeders/carts/carts.seeder.service';
import { PaymentsSeederService } from './seeders/payments/payments.seeder.service';
import { CouponsSeederService } from './seeders/coupons/coupons.seeder.service';
import { UserCouponsSeederService } from './seeders/user-coupons/user-coupons.seeder.service';
import { OrdersSeederService } from './seeders/orders/orders.seeder.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('Seeder');
  logger.log('Iniciando proceso de seed...');

  const appContext = await NestFactory.createApplicationContext(DatabaseModule);
  const dataSource = appContext.get(DataSource);

  try {
    // Ejecutar los seeders en orden (primero roles y permisos, luego asignaciones, luego usuarios)
    logger.log('Ejecutando seeder de permisos...');
    const permissionsSeeder = appContext.get(PermissionsSeeder);
    await permissionsSeeder.run(dataSource);

    logger.log('Ejecutando seeder de roles...');
    const rolesSeeder = appContext.get(RolesSeeder);
    await rolesSeeder.run(dataSource);

    logger.log('Ejecutando seeder de asignaciones de roles y permisos...');
    const rolePermissionsSeeder = appContext.get(RolePermissionsSeeder);
    await rolePermissionsSeeder.run(dataSource);

    logger.log('Ejecutando seeder de usuarios...');
    const usersSeederService = appContext.get(UsersSeederService);
    await usersSeederService.run(dataSource);

    logger.log('Ejecutando seeder de relaciones entre usuarios y roles...');
    const userRolesSeeder = appContext.get(UserRolesSeeder);
    await userRolesSeeder.run(dataSource);

    logger.log('Ejecutando seeder de direcciones...');
    const addressesSeederService = appContext.get(AddressesSeederService);
    await addressesSeederService.run(dataSource);

    logger.log('Ejecutando seeder de categorías...');
    const categoriesSeederService = appContext.get(CategoriesSeederService);
    await categoriesSeederService.run(dataSource);

    logger.log('Ejecutando seeder de productos...');
    const productsSeederService = appContext.get(ProductsSeederService);
    await productsSeederService.run(dataSource);

    logger.log('Ejecutando seeder de carritos...');
    const cartsSeederService = appContext.get(CartsSeederService);
    await cartsSeederService.run(dataSource);

    logger.log('Ejecutando seeder de pagos...');
    const paymentsSeederService = appContext.get(PaymentsSeederService);
    await paymentsSeederService.run(dataSource);

    logger.log('Ejecutando seeder de cupones...');
    const couponsSeederService = appContext.get(CouponsSeederService);
    await couponsSeederService.run(dataSource);

    logger.log('Ejecutando seeder de asignaciones de cupones a usuarios...');
    const userCouponsSeederService = appContext.get(UserCouponsSeederService);
    await userCouponsSeederService.run(dataSource);

    logger.log('Ejecutando seeder de órdenes...');
    const ordersSeederService = appContext.get(OrdersSeederService);
    await ordersSeederService.run(dataSource);

    logger.log('Proceso de seed completado exitosamente!');
  } catch (error) {
    logger.error(`Error durante el proceso de seed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    await appContext.close();
  }
}

bootstrap();
