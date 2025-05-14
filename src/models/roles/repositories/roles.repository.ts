import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { RoleSerializer } from '../serializers/role.serializer';

@Injectable()
export class RolesRepository extends ModelRepository<Role, RoleSerializer> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(RoleSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Role);
    this.metadata = this.repository.metadata;
  }

  /**
   * Obtener todos los roles
   */
  async findAll(): Promise<RoleSerializer[]> {
    return this.getAll(['rolePermissions']);
  }

  /**
   * Buscar rol por id
   */
  async findById(id: string): Promise<RoleSerializer | null> {
    return this.get(id, ['rolePermissions']);
  }

  /**
   * Buscar rol por slug
   */
  async findBySlug(slug: string): Promise<RoleSerializer | null> {
    return this.getBy({ slug }, ['rolePermissions'], false);
  }

  /**
   * Crear un nuevo rol
   */
  async create(roleData: Partial<Role>): Promise<RoleSerializer> {
    return this.createEntity(roleData, ['rolePermissions']);
  }

  /**
   * Actualizar un rol existente
   */
  async update(
    id: string,
    roleData: Partial<Role>,
  ): Promise<RoleSerializer | null> {
    return this.updateEntity(id, roleData, ['rolePermissions']);
  }

  /**
   * Eliminar un rol
   */
  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }
}
