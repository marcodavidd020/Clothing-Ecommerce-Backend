import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsSeeder } from './permissions.seeder';
import { Permission } from '../../../models/permissions/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsSeeder],
  exports: [PermissionsSeeder],
})
export class PermissionsSeederModule {} 