import { NestFactory } from '@nestjs/core';
import { UsersSeederService } from './seeders/users/seeder.service';
import { AddressesSeederService } from './seeders/addresses/seeder.service';
import { RolesSeeder } from './seeders/roles/roles.seeder';
import { PermissionsSeeder } from './seeders/permissions/permissions.seeder';
import { RolePermissionsSeeder } from './seeders/roles/role-permissions.seeder';
import { UserRolesSeeder } from './seeders/users/user-roles.seeder';
import { DatabaseModule } from './database.module';
import { Logger } from '@nestjs/common';
import { CategoriesSeederService } from './seeders/categories/categories.seeder';
import { ProductsSeederService } from './seeders/products/products.seeder';
import { CartsSeederService } from './seeders/carts/carts.seeder';
import { PaymentsSeederService } from './seeders/payments/payments.seeder';
import { CouponsSeederService } from './seeders/coupons/coupons.seeder';
import { UserCouponsSeederService } from './seeders/user-coupons/user-coupons.seeder';
import { OrdersSeederService } from './seeders/orders/orders.seeder';

async function bootstrap() {
  const logger = new Logger('Seeder');
  logger.log('Iniciando proceso de seed...');

  const appContext = await NestFactory.createApplicationContext(DatabaseModule);

  try {
    // Ejecutar los seeders en orden (primero roles y permisos, luego asignaciones, luego usuarios)
    logger.log('Ejecutando seeder de permisos...');
    const permissionsSeeder = appContext.get(PermissionsSeeder);
    await permissionsSeeder.seed();

    logger.log('Ejecutando seeder de roles...');
    const rolesSeeder = appContext.get(RolesSeeder);
    await rolesSeeder.seed();

    logger.log('Ejecutando seeder de asignaciones de roles y permisos...');
    const rolePermissionsSeeder = appContext.get(RolePermissionsSeeder);
    await rolePermissionsSeeder.seed();

    logger.log('Ejecutando seeder de usuarios...');
    const usersSeederService = appContext.get(UsersSeederService);
    await usersSeederService.seed();

    logger.log('Ejecutando seeder de relaciones entre usuarios y roles...');
    const userRolesSeeder = appContext.get(UserRolesSeeder);
    await userRolesSeeder.seed();

    logger.log('Ejecutando seeder de direcciones...');
    const addressesSeederService = appContext.get(AddressesSeederService);
    await addressesSeederService.seed();

    logger.log('Ejecutando seeder de categorías...');
    const categoriesSeederService = appContext.get(CategoriesSeederService);
    await categoriesSeederService.seed();

    logger.log('Ejecutando seeder de productos...');
    const productsSeederService = appContext.get(ProductsSeederService);
    await productsSeederService.seed();

    logger.log('Ejecutando seeder de carritos...');
    const cartsSeederService = appContext.get(CartsSeederService);
    await cartsSeederService.seed();

    logger.log('Ejecutando seeder de pagos...');
    const paymentsSeederService = appContext.get(PaymentsSeederService);
    await paymentsSeederService.seed();

    logger.log('Ejecutando seeder de cupones...');
    const couponsSeederService = appContext.get(CouponsSeederService);
    await couponsSeederService.seed();

    logger.log('Ejecutando seeder de asignaciones de cupones a usuarios...');
    const userCouponsSeederService = appContext.get(UserCouponsSeederService);
    await userCouponsSeederService.seed();

    logger.log('Ejecutando seeder de órdenes...');
    const ordersSeederService = appContext.get(OrdersSeederService);
    await ordersSeederService.seed();

    logger.log('Proceso de seed completado exitosamente!');
  } catch (error) {
    logger.error(`Error durante el proceso de seed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    await appContext.close();
  }
}

bootstrap();
