import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class RemoveVariantStockDto {
  @ApiProperty({
    description: 'Cantidad de stock a remover de la variante.',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;
}
