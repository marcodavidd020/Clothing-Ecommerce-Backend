import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';

export class ProductImageSerializer extends ModelSerializer {
  @Expose()
  @ApiProperty({
    description: 'ID único de la imagen',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  declare id: string;

  @Expose()
  @ApiProperty({
    description: 'URL de la imagen',
    example: 'https://example.com/images/product1-detail.jpg',
  })
  url: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Texto alternativo para la imagen',
    example: 'Vista frontal del Smartphone XYZ en color rojo',
    nullable: true,
  })
  alt: string | null;

  @Expose()
  @ApiProperty({
    description: 'ID del producto al que pertenece esta imagen',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string;
}
