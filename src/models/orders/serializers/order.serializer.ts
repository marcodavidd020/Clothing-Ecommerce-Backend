import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Order } from '../entities/order.entity';
import { OrderItemSerializer } from './order-item.serializer';
import { UserSerializer } from '../../users/serializers/user.serializer';
import { AddressSerializer } from '../../addresses/serializers/address.serializer';
import { PaymentSerializer } from '../../payments/serializers/payment.serializer';
import { CouponSerializer } from '../../coupons/serializers/coupon.serializer';
import { OrderStatusEnum } from '../constants/order.enums';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../payments/constants/payment.enums';

export class OrderSerializer extends ModelSerializer {
  @ApiPropertyOptional({
    description: 'ID del usuario que realizó la orden.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Expose()
  user_id: string | null;

  @ApiPropertyOptional({
    description: 'Datos del usuario.',
    type: () => UserSerializer,
  })
  @Expose()
  @Type(() => UserSerializer)
  user?: UserSerializer | null;

  @ApiPropertyOptional({
    description: 'ID de la dirección de envío.',
    example: 'c0b7e2a3-8f3d-4c9a-a8b7-3d2f1c0e8a5b',
  })
  @Expose()
  address_id: string | null;

  @ApiPropertyOptional({
    description: 'Datos de la dirección de envío.',
    type: () => AddressSerializer,
  })
  @Expose()
  @Type(() => AddressSerializer)
  address?: AddressSerializer | null;

  @ApiPropertyOptional({
    description: 'ID del pago asociado.',
    example: 'd1c2b3a4-e5f6-7890-1234-567890abcde',
  })
  @Expose()
  payment_id: string | null;

  @ApiPropertyOptional({
    description: 'Datos del pago.',
    type: () => PaymentSerializer,
  })
  @Expose()
  @Type(() => PaymentSerializer)
  payment?: PaymentSerializer | null;

  @ApiPropertyOptional({
    description: 'ID del cupón aplicado.',
    example: 'e2f3a4b5-c6d7-8901-2345-67890abcde',
  })
  @Expose()
  coupon_id: string | null;

  @ApiPropertyOptional({
    description: 'Datos del cupón aplicado.',
    type: () => CouponSerializer,
  })
  @Expose()
  @Type(() => CouponSerializer)
  coupon?: CouponSerializer | null;

  @ApiProperty({
    description: 'Monto total de la orden.',
    example: 199.99,
  })
  @Expose()
  totalAmount: number;

  @ApiProperty({
    description: 'Estado actual de la orden.',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PROCESSING,
  })
  @Expose()
  status: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Estado del pago de la orden.',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PAID,
  })
  @Expose()
  paymentStatus: PaymentStatusEnum | null;

  @ApiPropertyOptional({
    description: 'Método de pago utilizado.',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CARD,
  })
  @Expose()
  paymentMethod: PaymentMethodEnum | null;

  @ApiProperty({
    description: 'Items incluidos en la orden.',
    type: [OrderItemSerializer],
  })
  @Expose()
  @Type(() => OrderItemSerializer)
  items: OrderItemSerializer[];

  constructor(partial: Partial<Order>) {
    super(partial);
    Object.assign(this, partial);
  }
} 