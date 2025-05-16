import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Nueva cantidad para el item del carrito.',
    example: 2,
    minimum: 0, // Permitir 0 para posible eliminación o marcado
  })
  @IsInt()
  @Min(0)
  quantity: number;
}
