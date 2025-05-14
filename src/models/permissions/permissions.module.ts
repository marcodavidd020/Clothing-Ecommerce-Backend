import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission]),
    forwardRef(() => RolesModule),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsRepository, PermissionsService],
  exports: [PermissionsRepository, PermissionsService],
})
export class PermissionsModule {}
