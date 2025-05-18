import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../../models/roles/entities/role.entity';
import { Permission } from '../../../models/permissions/entities/permission.entity';
import { RolePermission } from '../../../models/permissions/entities/role-permission.entity';
import { Seeder } from '../seeder.interface';

@Injectable()
export class RolePermissionsSeeder implements Seeder {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    // Comprobar si ya existen asignaciones
    const count = await this.rolePermissionRepository.count();
    if (count > 0) {
      console.log(
        'Las asignaciones de permisos ya están creadas, saltando seeder...',
      );
      return;
    }

    // Obtener todos los roles y permisos
    const superAdminRole = await this.createOrGetRole('superadmin', 'Super Administrador');
    const adminRole = await this.rolesRepository.findOne({
      where: { slug: 'admin' },
    });
    const userRole = await this.rolesRepository.findOne({ where: { slug: 'user' } });
    const managerRole = await this.rolesRepository.findOne({
      where: { slug: 'manager' },
    });

    if (!superAdminRole || !adminRole || !userRole || !managerRole) {
      console.log(
        'No se encontraron los roles necesarios para asignar permisos',
      );
      return;
    }

    const allPermissions = await this.permissionsRepository.find();

    // Asignar TODOS los permisos al rol de superadmin
    const superAdminPermissions = allPermissions.map((permission) => {
      const rolePermission = new RolePermission();
      rolePermission.role = superAdminRole;
      rolePermission.permission = permission;
      return rolePermission;
    });

    // Asignar todos los permisos al rol de admin
    const adminPermissions = allPermissions.map((permission) => {
      const rolePermission = new RolePermission();
      rolePermission.role = adminRole;
      rolePermission.permission = permission;
      return rolePermission;
    });

    // Asignar permisos básicos al rol de usuario
    const userPermissions = allPermissions
      .filter((permission) => permission.name.startsWith('users.view'))
      .map((permission) => {
        const rolePermission = new RolePermission();
        rolePermission.role = userRole;
        rolePermission.permission = permission;
        return rolePermission;
      });

    // Asignar permisos de gestión al rol de gestor
    const managerPermissions = allPermissions
      .filter(
        (permission) =>
          permission.name.startsWith('users.') ||
          permission.name === 'roles.view' ||
          permission.name === 'permissions.view',
      )
      .map((permission) => {
        const rolePermission = new RolePermission();
        rolePermission.role = managerRole;
        rolePermission.permission = permission;
        return rolePermission;
      });

    // Guardar todas las asignaciones
    await this.rolePermissionRepository.save([
      ...superAdminPermissions,
      ...adminPermissions,
      ...userPermissions,
      ...managerPermissions,
    ]);

    console.log('Permisos asignados a roles correctamente');
  }

  /**
   * Crear o obtener un rol
   */
  private async createOrGetRole(slug: string, name: string): Promise<Role | null> {
    const existingRole = await this.rolesRepository.findOne({
      where: { slug }
    });

    if (existingRole) {
      return existingRole;
    }

    try {
      const newRole = this.rolesRepository.create({
        slug,
        name
      });
      return await this.rolesRepository.save(newRole);
    } catch (error) {
      console.error(`Error creating role ${slug}:`, error);
      return null;
    }
  }
}
