import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariantSerializer } from './product-variant.serializer';
import { ProductImageSerializer } from './product-image.serializer';
import { CategorySerializer } from '../../categories/serializers/category.serializer';
import { ModelSerializer } from '../../common/serializers/model.serializer';

export class ProductSerializer extends ModelSerializer {
  @Expose()
  @ApiProperty({ description: 'ID único del producto', example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ description: 'Nombre del producto', example: 'Smartphone XYZ' })
  name: string;

  @Expose()
  @ApiPropertyOptional({ description: 'URL de la imagen principal', example: 'https://example.com/images/product1.jpg', nullable: true })
  image: string | null;

  @Expose()
  @ApiProperty({ description: 'Slug único para la URL del producto', example: 'smartphone-xyz' })
  slug: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Descripción detallada del producto', example: 'Este smartphone cuenta con las siguientes características...', nullable: true })
  description: string | null;

  @Expose()
  @ApiProperty({ description: 'Precio del producto', example: 599.99 })
  price: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Precio con descuento (si aplica)', example: 499.99, nullable: true })
  discountPrice: number | null;

  @Expose()
  @ApiProperty({ description: 'Cantidad en stock del producto', example: 100 })
  stock: number;

  @Expose()
  @ApiProperty({ description: 'Fecha de creación del producto', example: '2023-01-15T12:00:00Z' })
  declare createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Fecha de última actualización del producto', example: '2023-02-20T15:30:00Z' })
  declare updatedAt: Date;

  @Expose()
  @Type(() => CategorySerializer)
  @ApiPropertyOptional({ 
    description: 'Categorías a las que pertenece el producto',
    type: [CategorySerializer]
  })
  categories?: CategorySerializer[];

  @Expose()
  @Type(() => ProductVariantSerializer)
  @ApiPropertyOptional({ 
    description: 'Variantes del producto',
    type: [ProductVariantSerializer]
  })
  variants?: ProductVariantSerializer[];

  @Expose()
  @Type(() => ProductImageSerializer)
  @ApiPropertyOptional({ 
    description: 'Imágenes adicionales del producto',
    type: [ProductImageSerializer]
  })
  images?: ProductImageSerializer[];
} 