import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Permission as PermissionEntity } from '../../../models/permissions/entities/permission.entity';
import { PERMISSIONS_LIST } from '../../../common/constants/permissions.enum';
import { Seeder } from '../seeder.interface';

@Injectable()
export class PermissionsSeeder implements Seeder {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Comprobar si ya existen permisos
    const count = await this.permissionsRepository.count();
    if (count > 0) {
      console.log('Los permisos ya están creados, saltando seeder...');
      return;
    }

    // Crear permisos a partir de la lista de permisos con descripciones
    for (const permissionData of PERMISSIONS_LIST) {
      const permission = this.permissionsRepository.create({
        name: permissionData.name,
        description: permissionData.description,
      });
      await this.permissionsRepository.save(permission);
    }

    console.log(`${PERMISSIONS_LIST.length} permisos creados correctamente`);
  }
}
