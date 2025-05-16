import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Address } from '../entities/address.entity';
import { UserSerializer } from 'src/models/users/serializers/user.serializer';

export class AddressSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'Calle Principal 123',
    description: 'Calle y número',
  })
  @Expose()
  street: string;

  @ApiProperty({
    example: 'Madrid',
    description: 'Ciudad',
  })
  @Expose()
  city: string;

  @ApiProperty({
    example: 'Santa Cruz',
    description: 'Departamento o provincia',
  })
  @Expose()
  department: string;

  @ApiProperty({
    example: '28001',
    description: 'Código postal',
  })
  @Expose()
  postalCode: string;

  @ApiProperty({
    example: 17.060816,
    description: 'Latitud de la dirección',
  })
  @Expose()
  latitude: number;

  @ApiProperty({
    example: -63.163044,
    description: 'Longitud de la dirección',
  })
  @Expose()
  longitude: number;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo para la entrega',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Número de teléfono para la entrega',
  })
  @Expose()
  phoneNumber: string;

  @ApiProperty({
    example: true,
    description: 'Si es la dirección predeterminada',
  })
  @Expose()
  isDefault: boolean;

  @Expose()
  @Type(() => UserSerializer)
  @ApiProperty({ type: () => UserSerializer, description: 'Usuario propietario de la dirección' })
  user: UserSerializer;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario propietario de la dirección',
  })
  @Expose()
  userId: string;

  constructor(partial: Partial<Address>) {
    super();
    Object.assign(this, partial);
  }
}
