import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaymentStatusEnum,
  PaymentMethodEnum,
} from '../constants/payment.enums';
import { Type } from 'class-transformer';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiPropertyOptional({
    example: 'Stripe',
    description: 'Proveedor del servicio de pago (ej. Stripe, PayPal)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Método de pago utilizado',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CARD,
  })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  method?: PaymentMethodEnum;

  @ApiPropertyOptional({
    example: 100.5,
    description: 'Monto del pago',
    type: Number,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  @IsNotEmpty()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Nuevo estado del pago',
    enum: PaymentStatusEnum,
  })
  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  @IsNotEmpty()
  status?: PaymentStatusEnum;

  @ApiPropertyOptional({
    description: 'ID de la transacción externa',
    example: 'pi_3JZq9z2eZvKYlo2C1A7C0sX1',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  transactionId?: string;
}
