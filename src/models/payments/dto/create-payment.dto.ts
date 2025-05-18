import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../constants/payment.enums';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'Stripe',
    description: 'Proveedor del servicio de pago (ej. Stripe, PayPal)',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  provider: string;

  @ApiProperty({
    description: 'Método de pago utilizado',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @ApiProperty({
    example: 100.5,
    description: 'Monto del pago',
    type: Number,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  // Podrías necesitar un orderId o userId aquí dependiendo de tu lógica de negocio
  // @ApiPropertyOptional({
  //   description: 'ID de la orden asociada a este pago',
  //   example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  // })
  // @IsOptional()
  // @IsUUID()
  // orderId?: string;

  // @ApiPropertyOptional({
  //   description: 'ID del usuario que realiza el pago',
  //   example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  // })
  // @IsOptional()
  // @IsUUID()
  // userId?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial del pago',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum = PaymentStatusEnum.PENDING;

  @ApiPropertyOptional({
    description: 'ID de la transacción externa (opcional al crear)',
    example: 'pi_3JZq9z2eZvKYlo2C1A7C0sX1',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  transactionId?: string;
}
