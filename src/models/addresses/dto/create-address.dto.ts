import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserExists } from '../../../common/decorators/validations/UserExists';

/**
 * DTO para la creación de direcciones
 */
export class CreateAddressDto {
  @ApiProperty({
    example: 'Calle Principal 123',
    description: 'Calle y número',
  })
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    example: 'Madrid',
    description: 'Ciudad',
  })
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: 'Madrid',
    description: 'Estado o provincia',
  })
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    example: '28001',
    description: 'Código postal',
  })
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    example: 'España',
    description: 'País',
  })
  @IsNotEmpty()
  country: string;

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
