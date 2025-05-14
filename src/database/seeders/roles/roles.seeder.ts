import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../models/roles/entities/role.entity';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async seed(): Promise<void> {
    // Comprobar si ya existen roles
    const count = await this.rolesRepository.count();
    if (count > 0) {
      console.log('Los roles ya están creados, saltando seeder...');
      return;
    }

    // Crear roles básicos
    const roles = [
      {
        name: 'Super Administrador',
        slug: 'superadmin',
      },
      {
        name: 'Administrador',
        slug: 'admin',
      },
      {
        name: 'Usuario',
        slug: 'user',
      },
      {
        name: 'Gestor',
        slug: 'manager',
      },
      {
        name: 'Cliente',
        slug: 'client',
      },
    ];

    for (const roleData of roles) {
      const role = this.rolesRepository.create(roleData);
      await this.rolesRepository.save(role);
    }

    console.log('Roles creados correctamente');
  }
}
