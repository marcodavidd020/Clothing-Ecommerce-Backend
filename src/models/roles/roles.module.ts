import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolesRepository } from './repositories/roles.repository';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole]),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [RolesController],
  providers: [RolesRepository, RolesService],
  exports: [RolesRepository, RolesService],
})
export class RolesModule {}
