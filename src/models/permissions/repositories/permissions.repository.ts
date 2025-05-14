import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { PermissionSerializer } from '../serializers/permission.serializer';

@Injectable()
export class PermissionsRepository extends ModelRepository<
  Permission,
  PermissionSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(PermissionSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Permission);
    this.metadata = this.repository.metadata;
  }

  /**
   * Obtener todos los permisos
   */
  async findAll(): Promise<PermissionSerializer[]> {
    return this.getAll(['rolePermissions']);
  }

  /**
   * Buscar permiso por id
   */
  async findById(id: string): Promise<PermissionSerializer | null> {
    return this.get(id, ['rolePermissions']);
  }

  /**
   * Buscar permiso por nombre
   */
  async findByName(name: string): Promise<PermissionSerializer | null> {
    return this.getBy({ name }, ['rolePermissions'], false);
  }

  /**
   * Crear un nuevo permiso
   */
  async create(
    permissionData: Partial<Permission>,
  ): Promise<PermissionSerializer> {
    return this.createEntity(permissionData, ['rolePermissions']);
  }

  /**
   * Actualizar un permiso existente
   */
  async update(
    id: string,
    permissionData: Partial<Permission>,
  ): Promise<PermissionSerializer | null> {
    return this.updateEntity(id, permissionData, ['rolePermissions']);
  }

  /**
   * Eliminar un permiso
   */
  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }
}
