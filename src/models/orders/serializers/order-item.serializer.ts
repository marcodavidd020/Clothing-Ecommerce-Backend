import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { OrderItem } from '../entities/order-item.entity';
import { ProductVariantSerializer } from '../../products/serializers/product-variant.serializer';

export class OrderItemSerializer extends ModelSerializer {
  @ApiProperty({
    description: 'ID de la variante del producto.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @Expose()
  product_variant_id: string;

  @ApiProperty({
    description:
      'Detalles de la variante del producto en el momento de la compra.',
    type: () => ProductVariantSerializer, // Se mostrarán los datos de la variante
  })
  @Expose()
  @Type(() => ProductVariantSerializer)
  productVariant: ProductVariantSerializer; // Asume que la entidad carga productVariant

  @ApiProperty({
    description: 'Cantidad del producto en esta línea de orden.',
    example: 2,
  })
  @Expose()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto en el momento de la compra.',
    example: 49.99,
  })
  @Expose()
  price: number;

  @ApiProperty({
    description: 'Subtotal para esta línea de orden (cantidad * precio).',
    example: 99.98,
  })
  @Expose()
  get subtotal(): number {
    return this.quantity * this.price;
  }

  constructor(partial: Partial<OrderItem>) {
    super(partial);
    Object.assign(this, partial);
  }
}
