import { faker } from '@faker-js/faker';
import { DeepPartial } from 'typeorm';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { User } from '../../../models/users/entities/user.entity';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../../models/payments/constants/payment.enums';

export class PaymentFactory {
  static generate(
    overrideParams: Partial<Payment> = {},
    user?: User, // Usuario al que se asociará el pago
  ): DeepPartial<Payment> {
    const amount = parseFloat(faker.commerce.price({ min: 5, max: 500 }));
    const method = faker.helpers.arrayElement(Object.values(PaymentMethodEnum));
    let status = faker.helpers.arrayElement(Object.values(PaymentStatusEnum));

    // Ajustar el estado para que sea coherente con el método y la lógica de negocio
    if (
      method === PaymentMethodEnum.QR &&
      status === PaymentStatusEnum.REFUNDED
    ) {
      status = PaymentStatusEnum.PAID; // QR difícilmente se reembolsa directamente así
    }
    if (
      status === PaymentStatusEnum.REFUNDED &&
      overrideParams.status !== PaymentStatusEnum.PAID
    ) {
      // Solo se puede reembolsar un pago que primero fue PAGADO
      status = PaymentStatusEnum.PAID;
    }

    const paymentData: DeepPartial<Payment> = {
      provider: faker.helpers.arrayElement([
        'Stripe',
        'PayPal',
        'MercadoPago',
        'LocalGateway',
      ]),
      method: method,
      status: overrideParams.status || status,
      transactionId:
        status === PaymentStatusEnum.PAID ||
        status === PaymentStatusEnum.PROCESSING
          ? `txn_${faker.string.alphanumeric(20)}`
          : null,
      amount: overrideParams.amount || amount,
      isActive:
        overrideParams.isActive !== undefined ? overrideParams.isActive : true,
      // user: user, // TypeORM manejará la relación si pasamos userId
      // orderId: overrideParams.orderId // Si tuvieras un campo orderId
    };

    // Si se proporciona un usuario, podríamos querer establecer el userId directamente
    // o manejarlo en el seeder service, dependiendo de cómo esté configurada la entidad y el repo.
    // Por ahora, lo dejamos así y el seeder service se encargará de la asociación.

    return { ...paymentData, ...overrideParams };
  }

  static generateMany(
    count: number,
    baseOverrides: Partial<Payment> = {},
    user?: User,
  ): DeepPartial<Payment>[] {
    return Array(count)
      .fill(null)
      .map(() => this.generate({ ...baseOverrides }, user));
  }
}
