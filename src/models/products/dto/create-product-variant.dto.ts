import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductVariantDto {
  @ApiProperty({
    description: 'Color de la variante del producto',
    example: 'Rojo',
  })
  @IsNotEmpty({ message: 'El color no puede estar vacío' })
  @IsString({ message: 'El color debe ser una cadena de texto' })
  color: string;

  @ApiProperty({
    description: 'Talla de la variante del producto',
    example: 'XL',
  })
  @IsNotEmpty({ message: 'La talla no puede estar vacía' })
  @IsString({ message: 'La talla debe ser una cadena de texto' })
  size: string;

  @ApiPropertyOptional({
    description: 'Cantidad en stock de esta variante específica',
    example: 25,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number = 0;
}
