import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Address } from '../../../models/addresses/entities/address.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column('text', { array: true, nullable: true })
  roles: string[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Métodos de la entidad según el diagrama de clases
   */
  register(): void {
    // Implementación pendiente - La lógica está en AuthService
  }

  login(): void {
    // Implementación pendiente - La lógica está en AuthService
  }

  updateProfile(): void {
    // Implementación pendiente - La lógica está en UserService
  }

  assignRole(roleId: string): void {
    // Implementación pendiente - La lógica está en RolesService
  }

  revokeRole(roleId: string): void {
    // Implementación pendiente - La lógica está en RolesService
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permissionName Nombre del permiso a verificar
   * @returns Verdadero si el usuario tiene el permiso, falso en caso contrario
   */
  hasPermission(permissionName: string): boolean {
    // La implementación real está en AuthService.userHasPermission
    // Esta es solo una implementación básica para la entidad
    if (!this.userRoles) {
      return false;
    }

    // Verificar si alguno de los roles del usuario tiene el permiso
    for (const userRole of this.userRoles) {
      const role = userRole.role;
      // Verificar si el rol tiene el permiso
      if (
        role.rolePermissions?.some(
          (rp) => rp.permission.name === permissionName,
        )
      ) {
        return true;
      }
    }

    return false;
  }
}
