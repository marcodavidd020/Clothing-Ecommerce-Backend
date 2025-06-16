import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { OrderStatusEnum } from '../constants/order.enums';
import { PaymentStatusEnum } from '../../payments/constants/payment.enums';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la orden.',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.SHIPPED,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Nuevo estado del pago asociado a la orden.',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  paymentStatus?: PaymentStatusEnum;

  @ApiPropertyOptional({
    description:
      'ID de la transacción de pago (si se actualiza o añade después).',
    example: 'pi_abcdef123456',
  })
  @IsOptional()
  @IsString()
  payment_transaction_id?: string;

  // Otros campos que un administrador podría necesitar actualizar:
  @ApiPropertyOptional({
    description:
      'ID del pago asociado (raro de actualizar, pero posible en casos manuales).',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsUUID()
  payment_id?: string;
}
