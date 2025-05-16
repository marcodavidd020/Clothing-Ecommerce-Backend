import { Expose, Type, plainToClass } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { CartItem } from '../entities/cart-item.entity';
// Asumimos que existe un ProductVariantSerializer
import { ProductVariantSerializer } from '../../products/serializers/product-variant.serializer';
import { ProductVariant } from '../../products/entities/product-variant.entity';

export class CartItemSerializer extends ModelSerializer {
  @ApiProperty({
    description: 'ID de la variante del producto',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Expose()
  product_variant_id: string;

  // Opcionalmente, exponer el objeto ProductVariant completo serializado
  @ApiProperty({
    description: 'Detalles de la variante del producto',
    type: () => ProductVariantSerializer, // Referencia circular necesita función
  })
  @Expose()
  @Type(() => ProductVariantSerializer)
  productVariant: ProductVariantSerializer;

  @ApiProperty({
    description: 'Cantidad del producto en el carrito',
    example: 2,
  })
  @Expose()
  quantity: number;

  constructor(partial: Partial<CartItem>) {
    super(partial);
    // Usar plainToClass para asegurar que las transformaciones anidadas se aplican
    // Asignar las propiedades básicas primero
    Object.assign(this, partial);

    // Si partial.productVariant existe, serializarlo usando ProductVariantSerializer
    if (partial.productVariant) {
      // Asegurarse de que partial.productVariant sea un objeto plano o una entidad que class-transformer pueda procesar
      this.productVariant = plainToClass(
        ProductVariantSerializer,
        partial.productVariant, // Esto debe ser la entidad o DTO plano
      );
    } else if ((partial as any).product_variant) {
      // Manejar si la propiedad se llama product_variant
      this.productVariant = plainToClass(
        ProductVariantSerializer,
        (partial as any).product_variant,
      );
    }
    // productVariant_id ya se asigna por Object.assign o por el decorador Expose si es necesario
  }
}
