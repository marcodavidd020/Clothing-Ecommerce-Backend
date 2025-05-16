import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { RoleSerializer } from '../../roles/serializers/role.serializer';
import { AddressSerializer } from '../../addresses/serializers/address.serializer';

export class UserSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @Expose()
  lastName: string;

  @Exclude()
  password: string;

  @ApiProperty({
    example: '+34600000000',
    description: 'Teléfono del usuario',
    nullable: true,
  })
  @Expose()
  phoneNumber: string;

  @ApiProperty({
    example: true,
    description: 'Estado activo/inactivo del usuario',
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    example: 'https://ejemplo.com/avatar.jpg',
    description: 'URL del avatar del usuario',
    nullable: true,
  })
  @Expose()
  avatar: string;

  @ApiProperty({
    type: 'array',
    description: 'Direcciones asociadas al usuario',
  })
  @Expose()
  @Type(() => AddressSerializer)
  addresses: AddressSerializer[];

  @ApiProperty({
    type: 'array',
    description: 'Roles asignados al usuario (como cadenas)',
  })
  @Expose()
  roles: string[];

  @ApiProperty({
    type: 'array',
    description: 'Roles asignados al usuario (como objetos)',
  })
  @Expose()
  @Type(() => RoleSerializer)
  userRoles: RoleSerializer[];

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  @Expose()
  declare createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización del usuario',
  })
  @Expose()
  declare updatedAt: Date;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }
}
