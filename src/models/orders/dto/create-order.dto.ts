import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { PaymentMethodEnum } from '../../payments/constants/payment.enums';
// Asumimos que el user_id vendrá del usuario autenticado, no del body, o si es para admin, sí vendría del body.
// Por ahora, lo incluiré opcional para flexibilidad, pero en rutas de usuario se tomaría de req.user.

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID de la dirección de envío seleccionada.',
    example: 'c0b7e2a3-8f3d-4c9a-a8b7-3d2f1c0e8a5b',
  })
  @IsNotEmpty()
  @IsUUID()
  address_id: string;

  @ApiProperty({
    description: 'Método de pago elegido por el usuario.',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  payment_method: PaymentMethodEnum;

  @ApiProperty({
    description: 'Lista de items que componen la orden.',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description: 'Código del cupón de descuento a aplicar (si existe).',
    example: 'SUMMER20',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  coupon_code?: string;

  @ApiPropertyOptional({
    description:
      'ID del usuario (si un admin crea la orden para un usuario específico).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string; // Se usará si un admin crea la orden, sino se toma del usuario logueado.
}
