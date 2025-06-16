import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddVariantStockDto {
  @ApiProperty({
    description: 'Cantidad de stock a añadir a la variante.',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;
}
