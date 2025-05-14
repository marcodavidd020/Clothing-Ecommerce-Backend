import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IToken } from '../interfaces/token.interface';

@Exclude()
export class TokenSerializer implements IToken {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Token para renovar el token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 3600,
  })
  @Expose()
  expiresIn: number;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  @Expose()
  tokenType: string;

  constructor(partial: Partial<TokenSerializer>) {
    Object.assign(this, partial);
  }
}
