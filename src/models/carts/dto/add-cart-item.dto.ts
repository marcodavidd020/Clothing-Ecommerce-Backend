import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: 'ID de la variante del producto a añadir.',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  productVariantId: string;

  @ApiProperty({
    description: 'Cantidad del producto a añadir.',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
