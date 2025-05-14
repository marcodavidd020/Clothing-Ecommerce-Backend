import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Address } from '../entities/address.entity';

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
    example: 'Madrid',
    description: 'Estado o provincia',
  })
  @Expose()
  state: string;

  @ApiProperty({
    example: '28001',
    description: 'Código postal',
  })
  @Expose()
  postalCode: string;

  @ApiProperty({
    example: 'España',
    description: 'País',
  })
  @Expose()
  country: string;

  @ApiProperty({
    example: true,
    description: 'Si es la dirección predeterminada',
  })
  @Expose()
  isDefault: boolean;

  @Exclude()
  user: any;

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
