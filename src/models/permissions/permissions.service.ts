import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionSerializer } from './serializers/permission.serializer';
import { Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private readonly rolePermissionRepository: Repository<RolePermission>;

  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.rolePermissionRepository =
      this.dataSource.getRepository(RolePermission);
  }

  /**
   * Obtener todos los permisos
   */
  async findAll(): Promise<PermissionSerializer[]> {
    return this.permissionsRepository.findAll();
  }

  /**
   * Buscar un permiso por su ID
   */
  async findById(id: string): Promise<PermissionSerializer> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
    return permission;
  }

  /**
   * Buscar un permiso por su nombre
   */
  async findByName(name: string): Promise<PermissionSerializer | null> {
    return this.permissionsRepository.findByName(name);
  }

  /**
   * Crear un nuevo permiso
   */
  async create(permissionData: {
    name: string;
    description?: string;
  }): Promise<PermissionSerializer> {
    // Verificar si ya existe un permiso con el mismo nombre
    const existingPermission = await this.permissionsRepository.findByName(
      permissionData.name,
    );
    if (existingPermission) {
      throw new ConflictException(
        `El permiso ${permissionData.name} ya existe`,
      );
    }

    return this.permissionsRepository.create(permissionData);
  }

  /**
   * Actualizar un permiso existente
   */
  async update(
    id: string,
    permissionData: Partial<{
      name: string;
      description: string;
    }>,
  ): Promise<PermissionSerializer> {
    // Verificar que el permiso existe
    await this.findById(id);

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (permissionData.name) {
      const permission = await this.findById(id);
      if (
        permissionData.name !== permission.name &&
        (await this.findByName(permissionData.name))
      ) {
        throw new ConflictException(
          `El permiso ${permissionData.name} ya existe`,
        );
      }
    }

    const updatedPermission = await this.permissionsRepository.update(
      id,
      permissionData,
    );
    if (!updatedPermission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return updatedPermission;
  }

  /**
   * Eliminar un permiso
   */
  async delete(id: string): Promise<void> {
    // Verificar que el permiso existe
    await this.findById(id);

    const success = await this.permissionsRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }
  }

  /**
   * Asignar un permiso a un rol
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      // Verificar si ya existe la asignación
      const existingAssignment = await this.rolePermissionRepository.findOne({
        where: {
          role: { id: roleId },
          permission: { id: permissionId },
        },
      });

      if (existingAssignment) {
        this.logger.log(
          `El permiso ${permissionId} ya está asignado al rol ${roleId}`,
        );
        return;
      }

      // Crear nueva asignación
      await this.rolePermissionRepository.save({
        role: { id: roleId },
        permission: { id: permissionId },
      });

      this.logger.log(`Permiso ${permissionId} asignado al rol ${roleId}`);
    } catch (error) {
      this.logger.error(
        `Error asignando permiso ${permissionId} al rol ${roleId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Revocar un permiso de un rol
   */
  async revokePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const result = await this.rolePermissionRepository.delete({
        role: { id: roleId },
        permission: { id: permissionId },
      });

      if (result.affected === 0) {
        this.logger.warn(
          `No se encontró la asignación de permiso ${permissionId} para el rol ${roleId}`,
        );
      } else {
        this.logger.log(`Permiso ${permissionId} revocado del rol ${roleId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error revocando permiso ${permissionId} del rol ${roleId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener los permisos asignados a un rol
   */
  async getRolePermissions(roleId: string): Promise<PermissionSerializer[]> {
    try {
      const rolePermissions = await this.rolePermissionRepository.find({
        where: { role: { id: roleId } },
        relations: ['permission'],
      });

      return rolePermissions.map(
        (rolePermission) => new PermissionSerializer(rolePermission.permission),
      );
    } catch (error) {
      this.logger.error(
        `Error obteniendo permisos del rol ${roleId}: ${error.message}`,
      );
      return [];
    }
  }
}
