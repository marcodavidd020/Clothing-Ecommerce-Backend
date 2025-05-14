import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RolePermission } from '../../permissions/entities/role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  /**
   * Métodos de la entidad según el diagrama de clases
   */
  assignPermission(): void {
    // Implementación pendiente - La lógica está en RolesService
  }

  revokePermission(): void {
    // Implementación pendiente - La lógica está en RolesService
  }
}
