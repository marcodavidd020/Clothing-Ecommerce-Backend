import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ChangeProductStockDto {
  @ApiProperty({
    description: 'Cantidad para cambiar el stock (positivo para añadir, negativo para quitar).',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  amount: number;
} 