import { IsOptional, MinLength, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la actualización de usuarios
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsOptional()
  @MinLength(2)
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Pérez',
    description: 'Apellido del usuario',
    minLength: 2,
  })
  @IsOptional()
  @MinLength(2)
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+34600000000',
    description: 'Teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'nuevaContraseña123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/avatar.jpg',
    description: 'URL del avatar del usuario',
  })
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo del usuario',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
