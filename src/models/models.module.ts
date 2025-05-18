import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';
import { PaymentsModule } from './payments/payments.module';
import { CouponsModule } from './coupons/coupons.module';
import { UserCouponsModule } from './user-coupons/user-coupons.module';

@Module({
  imports: [
    UsersModule,
    AddressesModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
    PaymentsModule,
    CouponsModule,
    UserCouponsModule,
  ],
  exports: [
    UsersModule,
    AddressesModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
    PaymentsModule,
    CouponsModule,
    UserCouponsModule,
  ],
})
export class ModelsModule {}
