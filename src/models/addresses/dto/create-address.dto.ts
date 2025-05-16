import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserExists } from '../../../common/decorators/validations/UserExists';

/**
 * DTO para la creación de direcciones
 */
export class CreateAddressDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: '3900000000',
    description: 'Número de teléfono',
  })
  @IsNotEmpty()
  phoneNumber: string;

  // latitude
  @ApiProperty({
    example: 17.060816,
    description: 'Latitud',
  })
  @IsNotEmpty()
  latitude: number;

  // longitude
  @ApiProperty({
    example: -63.163044,
    description: 'Longitud',
  })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    example: 'Calle Principal 123',
    description: 'Calle y número',
  })
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: 'Santa Cruz de la Sierra',
    description: 'Ciudad',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'Santa Cruz',
    description: 'Estado o provincia',
  })
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    example: '28001',
    description: 'Código postal',
  })
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si es la dirección predeterminada',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario propietario de la dirección',
  })
  @IsNotEmpty()
  @UserExists()
  userId: string;
}
