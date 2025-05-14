import { IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la actualización de direcciones
 */
export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: 'Calle Principal 123',
    description: 'Calle y número',
  })
  @IsOptional()
  @IsNotEmpty()
  street?: string;

  @ApiPropertyOptional({
    example: 'Madrid',
    description: 'Ciudad',
  })
  @IsOptional()
  @IsNotEmpty()
  city?: string;

  @ApiPropertyOptional({
    example: 'Madrid',
    description: 'Estado o provincia',
  })
  @IsOptional()
  @IsNotEmpty()
  state?: string;

  @ApiPropertyOptional({
    example: '28001',
    description: 'Código postal',
  })
  @IsOptional()
  @IsNotEmpty()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'España',
    description: 'País',
  })
  @IsOptional()
  @IsNotEmpty()
  country?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si es la dirección predeterminada',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
