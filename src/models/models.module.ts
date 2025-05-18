import { Module } from '@nestjs/common';
import {
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
  OrdersModule,
  ReviewsModule,
} from './index';

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
    OrdersModule,
    ReviewsModule,
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
    OrdersModule,
    ReviewsModule,
  ],
})
export class ModelsModule {}
