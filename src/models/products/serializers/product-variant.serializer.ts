import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';

export class ProductVariantSerializer extends ModelSerializer {
  @Expose()
  @ApiProperty({ description: 'ID único de la variante', example: '550e8400-e29b-41d4-a716-446655440000' })
  declare id: string;

  @Expose()
  @ApiProperty({ description: 'Color de la variante', example: 'Rojo' })
  color: string;

  @Expose()
  @ApiProperty({ description: 'Talla de la variante', example: 'XL' })
  size: string;

  @Expose()
  @ApiProperty({ description: 'Cantidad en stock de esta variante', example: 25 })
  stock: number;

  @Expose()
  @ApiProperty({ description: 'ID del producto al que pertenece esta variante', example: '550e8400-e29b-41d4-a716-446655440000' })
  productId: string;
} 