import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../../models/users/entities/user.entity';
import { UserFactory } from '../../factories/users/factory';
import { Seeder } from '../seeder.interface';

@Injectable()
export class UsersSeederService implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Crear super admin
    const superAdminExists = await this.usersRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });

    if (!superAdminExists) {
      const superAdmin = this.usersRepository.create(
        UserFactory.generate({
          email: 'superadmin@example.com',
          firstName: 'Super',
          lastName: 'Admin',
          password: 'superadmin123', // Password fácil para pruebas
          roles: ['super_admin', 'user'],
        }),
      );
      await this.usersRepository.save(superAdmin);
      console.log('Super Admin user created');
    }

    // Crear usuario admin normal
    const adminExists = await this.usersRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      const admin = this.usersRepository.create(
        UserFactory.generate({
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'admin123', // Password fácil para pruebas
          roles: ['admin', 'user'],
        }),
      );
      await this.usersRepository.save(admin);
      console.log('Admin user created');
    }

    // Crear usuarios de prueba
    const usersCount = await this.usersRepository.count();
    if (usersCount < 6) {
      // Ahora necesitamos al menos 6 (superadmin, admin, y 4 usuarios normales)
      const usersToCreate = 6 - usersCount;
      if (usersToCreate > 0) {
        const users = UserFactory.generateMany(usersToCreate);

        for (const userData of users) {
          const user = this.usersRepository.create(userData);
          await this.usersRepository.save(user);
        }

        console.log(`${usersToCreate} test users created`);
      }
    }
  }
}
