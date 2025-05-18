import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Payment } from '../entities/payment.entity';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../constants/payment.enums';

export class PaymentSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'Stripe',
    description: 'Proveedor del servicio de pago',
  })
  @Expose()
  provider: string;

  @ApiProperty({
    description: 'Método de pago utilizado',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CARD,
  })
  @Expose()
  method: PaymentMethodEnum;

  @ApiProperty({
    description: 'Estado actual del pago',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PAID,
  })
  @Expose()
  status: PaymentStatusEnum;

  @ApiProperty({
    example: 'pi_3JZq9z2eZvKYlo2C1A7C0sX1',
    description: 'ID de la transacción del proveedor',
    nullable: true,
  })
  @Expose()
  transactionId: string | null;

  @ApiProperty({
    example: 100.5,
    description: 'Monto del pago',
    type: Number,
  })
  @Expose()
  amount: number;

  constructor(partial: Partial<Payment>) {
    super();
    Object.assign(this, partial);
  }
}
