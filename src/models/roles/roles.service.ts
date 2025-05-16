import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { RolesRepository } from './repositories/roles.repository';
import { UserRole } from './entities/user-role.entity';
import { RoleSerializer } from './serializers/role.serializer';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersRepository } from '../users/repositories/users.repository';
// import { User } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);
  private readonly userRoleRepository: Repository<UserRole>;

  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsService: PermissionsService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly usersRepository: UsersRepository,
  ) {
    this.userRoleRepository = this.dataSource.getRepository(UserRole);
  }

  /**
   * Obtener todos los roles
   */
  async findAll(): Promise<RoleSerializer[]> {
    return this.rolesRepository.findAll();
  }

  /**
   * Buscar un rol por su ID
   */
  async findById(id: string): Promise<RoleSerializer> {
    const role = await this.rolesRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return role;
  }

  /**
   * Buscar un rol por su slug
   */
  async findBySlug(slug: string): Promise<RoleSerializer | null> {
    return this.rolesRepository.findBySlug(slug);
  }

  /**
   * Crear un nuevo rol
   */
  async create(roleData: {
    name: string;
    slug: string;
  }): Promise<RoleSerializer> {
    // Verificar si ya existe un rol con el mismo slug
    const existingRole = await this.rolesRepository.findBySlug(roleData.slug);
    if (existingRole) {
      throw new ConflictException(`El slug ${roleData.slug} ya está en uso`);
    }

    return this.rolesRepository.create(roleData);
  }

  /**
   * Actualizar un rol existente
   */
  async update(
    id: string,
    roleData: Partial<{
      name: string;
      slug: string;
    }>,
  ): Promise<RoleSerializer> {
    // Verificar si el rol existe
    const role = await this.findById(id);

    // Si se está cambiando el slug, verificar que no exista otro con ese slug
    if (roleData.slug && roleData.slug !== role.slug) {
      const existingRole = await this.rolesRepository.findBySlug(roleData.slug);
      if (existingRole) {
        throw new ConflictException(`El slug ${roleData.slug} ya está en uso`);
      }
    }

    const updatedRole = await this.rolesRepository.update(id, roleData);
    if (!updatedRole) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return updatedRole;
  }

  /**
   * Eliminar un rol
   */
  async delete(id: string): Promise<void> {
    // Verificar que el rol existe
    await this.findById(id);

    const success = await this.rolesRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
  }

  /**
   * Asignar un rol a un usuario
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Verificar primero el estado del usuario
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);
    }

    if (!user.isActive) {
      throw new ConflictException(
        `No se puede asignar un rol a un usuario inactivo (ID: ${userId}).`,
      );
    }

    // Verificar que el rol exista (opcional, pero buena práctica)
    const roleToAssign = await this.rolesRepository.findById(roleId);
    if (!roleToAssign) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado.`);
    }

    try {
      // Verificar si ya existe la asignación
      const existingAssignment = await this.userRoleRepository.findOne({
        where: {
          user: { id: userId },
          role: { id: roleId },
        },
      });

      if (existingAssignment) {
        this.logger.log(
          `El rol ${roleId} ya está asignado al usuario ${userId}`,
        );
        return;
      }

      // Crear nueva asignación
      await this.userRoleRepository.save({
        user: { id: userId },
        role: { id: roleId },
      });

      // Obtener el slug del rol
      const role = await this.rolesRepository.findById(roleId);

      // Actualizar el campo roles del usuario
      const userRepository = this.dataSource.getRepository('User');
      const user = await userRepository.findOne({ where: { id: userId } });

      if (user && role) {
        // Inicializar roles si no existe
        if (!user.roles) {
          user.roles = [];
        }

        // Añadir el slug del rol si no existe ya
        if (!user.roles.includes(role.slug)) {
          user.roles.push(role.slug);
          await userRepository.save(user);
        }
      }

      this.logger.log(`Rol ${roleId} asignado al usuario ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error asignando rol ${roleId} al usuario ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Revocar un rol de un usuario
   */
  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      const result = await this.userRoleRepository.delete({
        user: { id: userId },
        role: { id: roleId },
      });

      if (result.affected === 0) {
        this.logger.warn(
          `No se encontró la asignación de rol ${roleId} para el usuario ${userId}`,
        );
      } else {
        // Obtener el slug del rol
        const role = await this.rolesRepository.findById(roleId);

        // Actualizar el campo roles del usuario
        if (role) {
          const userRepository = this.dataSource.getRepository('User');
          const user = await userRepository.findOne({ where: { id: userId } });

          if (user && Array.isArray(user.roles)) {
            // Eliminar el slug del rol del array
            user.roles = user.roles.filter((slug) => slug !== role.slug);
            await userRepository.save(user);
          }
        }

        this.logger.log(`Rol ${roleId} revocado del usuario ${userId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error revocando rol ${roleId} del usuario ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener los roles de un usuario
   */
  async getUserRoles(userId: string): Promise<RoleSerializer[]> {
    try {
      const userRoles = await this.userRoleRepository.find({
        where: { user: { id: userId } },
        relations: ['role'],
      });

      return userRoles.map((userRole) => new RoleSerializer(userRole.role));
    } catch (error) {
      this.logger.error(
        `Error obteniendo roles del usuario ${userId}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  async roleHasPermission(
    roleId: string,
    permissionName: string,
  ): Promise<boolean> {
    try {
      const rolePermissions =
        await this.permissionsService.getRolePermissions(roleId);

      return rolePermissions.some(
        (permission) => permission.name === permissionName,
      );
    } catch (error) {
      this.logger.error(
        `Error verificando permiso ${permissionName} para rol ${roleId}: ${error.message}`,
      );
      return false;
    }
  }

  /**
   * Asignar un permiso a un rol
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.permissionsService.assignPermissionToRole(roleId, permissionId);
  }

  /**
   * Revocar un permiso de un rol
   */
  async revokePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.permissionsService.revokePermissionFromRole(
      roleId,
      permissionId,
    );
  }
}
