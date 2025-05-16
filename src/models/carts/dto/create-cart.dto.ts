import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID del usuario al que pertenecerá el carrito.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  userId: string;
}
