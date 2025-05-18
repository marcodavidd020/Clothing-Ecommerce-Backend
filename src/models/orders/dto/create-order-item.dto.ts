import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID de la variante del producto a añadir a la orden.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsNotEmpty()
  @IsUUID()
  product_variant_id: string;

  @ApiProperty({
    description: 'Cantidad del producto en esta línea de la orden.',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  // El precio se determinará en el backend al momento de crear la orden,
  // basado en el precio actual de la variante y posibles descuentos de producto.
  // No se espera que el cliente envíe el precio del item.
}
