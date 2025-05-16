import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateVariantDetailsDto {
  @ApiPropertyOptional({
    description: 'Nuevo color de la variante.',
    example: 'Azul Marino',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  color?: string;

  @ApiPropertyOptional({
    description: 'Nueva talla de la variante.',
    example: 'XL',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  size?: string;

  @ApiPropertyOptional({
    description: 'Nuevo stock total para la variante.',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
