import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Permission } from '../entities/permission.entity';

@Exclude()
export class PermissionSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'users.create',
    description: 'Nombre del permiso',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'Permite crear usuarios en el sistema',
    description: 'Descripción del permiso',
  })
  @Expose()
  description: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de creación del permiso',
  })
  @Expose()
  declare createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Fecha de última actualización del permiso',
  })
  @Expose()
  declare updatedAt: Date;

  constructor(partial: Partial<Permission>) {
    super(partial);
    Object.assign(this, partial);
  }
}
