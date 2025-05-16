import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Cart } from '../entities/cart.entity';
import { CartItemSerializer } from './cart-item.serializer';

export class CartSerializer extends ModelSerializer {
  @ApiProperty({
    description: 'ID del usuario asociado al carrito',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Expose()
  user_id: string;

  @ApiProperty({
    description: 'Items contenidos en el carrito',
    type: [CartItemSerializer],
  })
  @Expose()
  @Type(() => CartItemSerializer)
  items: CartItemSerializer[];

  @ApiProperty({
    description:
      'Total calculado del carrito (ejemplo, podría ser más complejo)',
    example: 150.75,
  })
  @Expose()
  total: number; // Este campo se calculará en el servicio y se añadirá antes de serializar

  constructor(partial: Partial<Cart>, total?: number) {
    super(partial);
    Object.assign(this, partial);
    if (partial.items) {
      this.items = partial.items.map((item) => new CartItemSerializer(item));
    }
    // El total se podría calcular y asignar aquí o venir ya calculado
    this.total = total !== undefined ? total : this.calculateTotal();
  }

  private calculateTotal(): number {
    // Esta es una implementación básica. En un caso real, se accedería a los precios de los ProductVariant.
    // La entidad ProductVariantSerializer debería tener una propiedad 'price'.
    if (!this.items || this.items.length === 0) return 0;

    return this.items.reduce((acc, item) => {
      // Acceder al precio a través de productVariant.product.price
      // Usar discountPrice si está disponible, sino el precio normal
      const price =
        item.productVariant?.product?.discountPrice ??
        item.productVariant?.product?.price ??
        0;
      return acc + item.quantity * price;
    }, 0);
  }
}
