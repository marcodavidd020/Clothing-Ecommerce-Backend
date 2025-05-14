import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token obtenido al iniciar sesión',
  })
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  @IsString({ message: 'El refresh token debe ser un string' })
  refreshToken: string;
}
