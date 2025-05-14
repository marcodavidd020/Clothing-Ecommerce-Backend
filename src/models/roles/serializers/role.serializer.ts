import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Role } from '../entities/role.entity';
import { PermissionSerializer } from '../../permissions/serializers/permission.serializer';

@Exclude()
export class RoleSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'Administrador',
    description: 'Nombre del rol',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'admin',
    description: 'Slug único del rol',
  })
  @Expose()
  slug: string;

  @ApiProperty({
    type: 'array',
    description: 'Permisos asignados al rol',
  })
  @Expose()
  @Type(() => PermissionSerializer)
  permissions: PermissionSerializer[];

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de creación del rol',
  })
  @Expose()
  declare createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización del rol',
  })
  @Expose()
  declare updatedAt: Date;

  constructor(partial: Partial<Role>) {
    super(partial);
    Object.assign(this, partial);
  }
}
