import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { PaymentSerializer } from '../serializers/payment.serializer';
import {
  IPaymentCreate,
  IPaymentUpdate,
} from '../interfaces/payment.interface';

@Injectable()
export class PaymentsRepository extends ModelRepository<
  Payment,
  PaymentSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(PaymentSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Payment);
    this.metadata = this.repository.metadata;
  }

  async findById(id: string): Promise<PaymentSerializer | null> {
    return this.get(id);
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentSerializer | null> {
    return this.getBy({ transactionId });
  }

  async createPayment(data: IPaymentCreate): Promise<PaymentSerializer> {
    return this.createEntity(data);
  }

  async updatePayment(
    id: string,
    data: IPaymentUpdate,
  ): Promise<PaymentSerializer | null> {
    return this.updateEntity(id, data);
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }
}
