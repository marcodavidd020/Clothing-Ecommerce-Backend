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
 * 
 * Este DTO se utiliza para validar y documentar los datos necesarios al registrar 
 * un nuevo usuario en el sistema de ecommerce.
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'cliente@tienda.com',
    description: 'Correo electrónico del usuario. Debe ser único en el sistema y se utilizará como identificador para iniciar sesión.',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  @UniqueUserEmail()
  email: string;

  @ApiProperty({
    example: 'María',
    description: 'Nombre del usuario. Se utilizará para personalizar comunicaciones y mostrar en el perfil.',
    required: true,
    minLength: 2,
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'González',
    description: 'Apellido del usuario. Se utilizará junto con el nombre para identificar al usuario en el sistema.',
    required: true,
    minLength: 2,
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'C0ntr4s3ña$3gur4',
    description: 'Contraseña para acceder al sistema. Debe tener al menos 6 caracteres. Se recomienda incluir mayúsculas, minúsculas, números y símbolos.',
    required: true,
    minLength: 6,
    format: 'password'
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: '+34612345678',
    description: 'Número de teléfono del usuario. Se utilizará para contacto y/o recuperación de cuenta.',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.tienda.com/avatars/usuario1.jpg',
    description: 'URL de la imagen de perfil del usuario. Si no se proporciona, se asignará un avatar predeterminado.',
  })
  @IsOptional()
  avatar?: string;
}
