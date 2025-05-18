import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from '../../../models/roles/entities/user-role.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Role } from '../../../models/roles/entities/role.entity';
import { Not } from 'typeorm';
import { Seeder } from '../seeder.interface';

@Injectable()
export class UserRolesSeeder implements Seeder {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Comprobar si ya existen asignaciones
    const count = await this.userRoleRepository.count();
    if (count > 0) {
      console.log(
        'Las asignaciones de roles a usuarios ya están creadas, saltando seeder...',
      );
      return;
    }

    // Obtener usuarios y roles
    const superAdmin = await this.userRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });

    const admin = await this.userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    // Obtener usuarios regulares (cualquier usuario que no sea admin o superadmin)
    const regularUsers = await this.userRepository.find({
      where: [
        { email: 'marco@gmail.com' }, // Incluimos explícitamente el usuario de prueba
      ],
      take: 1, // Solo necesitamos uno para el ejemplo
    });

    if (!regularUsers.length) {
      // Si no encontramos ese usuario, buscamos cualquier otro que no sea admin o superadmin
      regularUsers.push(...await this.userRepository.find({
        where: [
          { email: Not('superadmin@example.com') },
          { email: Not('admin@example.com') },
        ],
        take: 1,
      }));
    }

    // Obtener roles
    const superAdminRole = await this.roleRepository.findOne({
      where: { slug: 'superadmin' },
    });

    const adminRole = await this.roleRepository.findOne({
      where: { slug: 'admin' },
    });

    const userRole = await this.roleRepository.findOne({
      where: { slug: 'user' },
    });

    const managerRole = await this.roleRepository.findOne({
      where: { slug: 'manager' },
    });

    // Validamos los roles mínimos necesarios
    if (!userRole) {
      console.log('Falta el rol de usuario necesario para asignar roles');
      return;
    }

    // Lista para almacenar todas las asignaciones
    const userRoles: UserRole[] = [];

    // Asignar rol de superadmin al superadmin
    if (superAdmin && superAdminRole) {
      userRoles.push(
        this.createUserRole(superAdmin, superAdminRole),
        this.createUserRole(superAdmin, userRole)
      );
      console.log('Asignados roles al superadmin');
    }

    // Asignar rol de admin al admin
    if (admin && adminRole) {
      userRoles.push(
        this.createUserRole(admin, adminRole),
        this.createUserRole(admin, userRole)
      );
      console.log('Asignados roles al admin');
    }

    // Asignar rol de usuario a los usuarios regulares
    if (regularUsers.length > 0) {
      for (const user of regularUsers) {
        userRoles.push(this.createUserRole(user, userRole));
        
        // Opcionalmente asignar rol de manager a un usuario
        if (managerRole) {
          userRoles.push(this.createUserRole(user, managerRole));
        }
      }
      console.log('Asignados roles a usuarios regulares');
    }

    // Si hay asignaciones a guardar, las guardamos
    if (userRoles.length > 0) {
      await this.userRoleRepository.save(userRoles);
      console.log(`${userRoles.length} asignaciones de roles a usuarios creadas correctamente`);
    } else {
      console.log('No se crearon asignaciones de roles');
    }
  }

  /**
   * Crear una asignación de rol a usuario
   */
  private createUserRole(user: User, role: Role): UserRole {
    const userRole = new UserRole();
    userRole.user = user;
    userRole.role = role;
    return userRole;
  }
} 