import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolesSeeder } from './user-roles.seeder';
import { UserRole } from '../../../models/roles/entities/user-role.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Role } from '../../../models/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Role])],
  providers: [UserRolesSeeder],
  exports: [UserRolesSeeder],
})
export class UserRolesSeederModule {}
