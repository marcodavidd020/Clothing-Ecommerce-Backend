import { IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la actualización de direcciones
 */
export class UpdateAddressDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre completo',
  })
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({
    example: '3900000000',
    description: 'Número de teléfono',
  })
  @IsOptional()
  @IsNotEmpty()
  phoneNumber?: string;

  @ApiPropertyOptional({
    example: 17.060816,
    description: 'Latitud',
  })
  @IsOptional()
  @IsNotEmpty()
  latitude?: number;

  @ApiPropertyOptional({
    example: -63.163044,
    description: 'Longitud',
  })
  @IsOptional()
  @IsNotEmpty()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Santa Cruz',
    description: 'Departamento',
  })
  @IsOptional()
  @IsNotEmpty()
  department?: string;

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
    example: true,
    description: 'Si es la dirección predeterminada',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
