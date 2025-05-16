import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUrl,
  IsOptional,
  Min,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { CreateProductImageDto } from './create-product-image.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Smartphone XYZ',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen principal del producto',
    example: 'https://example.com/images/product1.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string | null;

  @ApiProperty({
    description: 'Slug único para la URL del producto',
    example: 'smartphone-xyz',
  })
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Este smartphone cuenta con las siguientes características...',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string | null;

  @ApiProperty({
    description: 'Precio del producto',
    example: 599.99,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Precio con descuento (si aplica)',
    example: 499.99,
    nullable: true,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El precio con descuento debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El precio con descuento no puede ser negativo' })
  @Type(() => Number)
  discountPrice?: number | null;

  @ApiPropertyOptional({
    description: 'Cantidad en stock del producto',
    example: 100,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @ApiPropertyOptional({
    description: 'IDs de las categorías a las que pertenece el producto',
    example: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Cada categoría debe ser un UUID válido',
  })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Variantes del producto',
    type: [CreateProductVariantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @ApiPropertyOptional({
    description: 'Imágenes adicionales del producto',
    type: [CreateProductImageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}
