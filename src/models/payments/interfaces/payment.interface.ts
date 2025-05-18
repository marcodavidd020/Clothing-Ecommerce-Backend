import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../constants/payment.enums';

export interface IPayment {
  id: string;
  provider: string;
  method: PaymentMethodEnum;
  status: PaymentStatusEnum;
  transactionId: string | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentCreate {
  provider: string;
  method: PaymentMethodEnum;
  amount: number;
  status?: PaymentStatusEnum; // Opcional, podría default a PENDING
  transactionId?: string | null; // Opcional al crear
  // Aquí se puede agregar otros campos necesarios para iniciar un pago, como orderId, userId, etc.
  // Ejemplo: userId?: string;
  // Ejemplo: orderId?: string;
}

export interface IPaymentUpdate {
  provider?: string;
  method?: PaymentMethodEnum;
  status?: PaymentStatusEnum;
  transactionId?: string | null;
  amount?: number;
}
