import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AddressesModule } from './addresses/addresses.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [UsersModule, AddressesModule, RolesModule, PermissionsModule],
  exports: [UsersModule, AddressesModule, RolesModule, PermissionsModule],
})
export class ModelsModule {}
