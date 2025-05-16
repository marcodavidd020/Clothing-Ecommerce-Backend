import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ApplyFixedDiscountDto {
  @ApiProperty({
    description: 'Monto fijo del descuento a aplicar (ej: 50 para $50).',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
} 