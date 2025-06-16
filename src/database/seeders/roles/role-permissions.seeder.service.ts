import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../../models/roles/entities/role.entity';
import { Permission } from '../../../models/permissions/entities/permission.entity';
import { RolePermission } from '../../../models/permissions/entities/role-permission.entity';
import { Seeder } from '../seeder.interface';
import { ProductPermissionsEnum } from 'src/models/products/constants/product-permissions.constant';
import { USER_TYPES, DEFAULT_ACCESS_ROLES } from 'src/common/constants/settings';
import { CategoryPermissionsEnum } from 'src/models/categories/constants/categorie-permissions';
import { UserPermissionsEnum } from 'src/models/users/constants/user-permissions';
import { RolePermissionsEnum } from 'src/models/roles/constants/role-permissions';
import { PermissionPermissionsEnum } from 'src/models/permissions/constants/permission-permissions';
import { OrderPermissionsEnum } from 'src/models/orders/constants/order-permissions';

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
    const superAdminRole = await this.createOrGetRole(
      DEFAULT_ACCESS_ROLES[0],
      DEFAULT_ACCESS_ROLES[1],
    );
    const adminRole = await this.rolesRepository.findOne({
      where: { slug: USER_TYPES.ADMIN },
    });
    const userRole = await this.rolesRepository.findOne({ where: { slug: USER_TYPES.USER } });
    const managerRole = await this.rolesRepository.findOne({
      where: { slug: USER_TYPES.MANAGER },
    });
    const clientRole = await this.rolesRepository.findOne({
      where: { slug: USER_TYPES.CLIENT },
    });

    if (!superAdminRole || !adminRole || !userRole || !managerRole || !clientRole) {
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
      .filter((permission) => permission.name.startsWith(UserPermissionsEnum.VIEW))
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
          permission.name === RolePermissionsEnum.VIEW ||
          permission.name === PermissionPermissionsEnum.VIEW,
      )
      .map((permission) => {
        const rolePermission = new RolePermission();
        rolePermission.role = managerRole;
        rolePermission.permission = permission;
        return rolePermission;
      });

    // Asignar permisos de ecommerce al rol de cliente (productos, categorías, órdenes, carrito)
    const clientPermissions = allPermissions
      .filter(
        (permission) =>
          // Permisos de productos y categorías (ya existentes)
          permission.name.startsWith(ProductPermissionsEnum.PRODUCT_VIEW) ||
          permission.name.startsWith(CategoryPermissionsEnum.VIEW) ||
          // Permisos de órdenes propias
          permission.name === OrderPermissionsEnum.CREATE_OWN ||
          permission.name === OrderPermissionsEnum.VIEW_OWN ||
          permission.name === OrderPermissionsEnum.CANCEL_OWN ||
          // Permisos de carrito (si existen)
          permission.name.includes('cart') ||
          // Permisos de cupones propios
          permission.name.includes('view_own:user_coupons') ||
          // Permisos de reseñas propias
          permission.name.includes('create_own:reviews') ||
          permission.name.includes('view_own:reviews'),
      )
      .map((permission) => {
        const rolePermission = new RolePermission();
        rolePermission.role = clientRole;
        rolePermission.permission = permission;
        return rolePermission;
      });

    // Guardar todas las asignaciones
    await this.rolePermissionRepository.save([
      ...superAdminPermissions,
      ...adminPermissions,
      ...userPermissions,
      ...managerPermissions,
      ...clientPermissions,
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
