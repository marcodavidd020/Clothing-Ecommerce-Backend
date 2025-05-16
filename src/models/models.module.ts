import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    UsersModule,
    AddressesModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
  ],
  exports: [
    UsersModule,
    AddressesModule,
    RolesModule,
    PermissionsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
  ],
})
export class ModelsModule {}
