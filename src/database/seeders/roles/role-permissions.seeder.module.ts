import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionsSeeder } from './role-permissions.seeder.service';
import { Role } from '../../../models/roles/entities/role.entity';
import { Permission } from '../../../models/permissions/entities/permission.entity';
import { RolePermission } from '../../../models/permissions/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [RolePermissionsSeeder],
  exports: [RolePermissionsSeeder],
})
export class RolePermissionsSeederModule {}
