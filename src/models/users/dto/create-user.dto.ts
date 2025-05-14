import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UniqueUserEmail } from '../../../common/decorators/validations/UniqueUserEmail';

/**
 * DTO para la creación de usuarios
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email único del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  @UniqueUserEmail()
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    minLength: 2,
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'contraseña123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: '+34600000000',
    description: 'Teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/avatar.jpg',
    description: 'URL del avatar del usuario',
  })
  @IsOptional()
  avatar?: string;
}
