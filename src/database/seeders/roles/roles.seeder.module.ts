import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesSeeder } from './roles.seeder.service';
import { Role } from '../../../models/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesSeeder],
  exports: [RolesSeeder],
})
export class RolesSeederModule {}
