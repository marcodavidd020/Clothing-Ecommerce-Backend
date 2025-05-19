import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../../models/roles/entities/role.entity';
import { Seeder } from '../seeder.interface';
import { USER_TYPES } from 'src/common/constants/settings';
@Injectable()
export class RolesSeeder implements Seeder {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Comprobar si ya existen roles
    const count = await this.rolesRepository.count();
    if (count > 0) {
      console.log('Los roles ya están creados, saltando seeder...');
      return;
    }

    // Crear roles básicos
    const roles = [
      {
        name: 'Super Admin',
        slug: USER_TYPES.SUPER_ADMIN,
      },
      {
        name: 'Admin',
        slug: USER_TYPES.ADMIN,
      },
      {
        name: 'User',
        slug: USER_TYPES.USER,
      },
      {
        name: 'Manager',
        slug: USER_TYPES.MANAGER,
      },
      {
        name: 'Client',
        slug: USER_TYPES.CLIENT,
      },
    ];

    for (const roleData of roles) {
      const role = this.rolesRepository.create(roleData);
      await this.rolesRepository.save(role);
    }

    console.log('Roles creados correctamente');
  }
}
