import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class ApplyDiscountPercentageDto {
  @ApiProperty({
    description: 'Porcentaje de descuento a aplicar (ej: 0.10 para 10%).',
    example: 0.1,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  percentage: number;
}
