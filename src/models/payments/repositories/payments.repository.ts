import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Payment } from '../entities/payment.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { PaymentSerializer } from '../serializers/payment.serializer';
import {
  IPaymentCreate,
  IPaymentUpdate,
} from '../interfaces/payment.interface';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';

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
    const payment = await this.repository.findOne({
      where: { id, isActive: true },
    });
    return payment ? this.transform(payment) : null;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentSerializer | null> {
    const payment = await this.repository.findOne({
      where: { transactionId, isActive: true },
    });
    return payment ? this.transform(payment) : null;
  }

  async createPayment(data: IPaymentCreate): Promise<PaymentSerializer> {
    const paymentToCreate = this.repository.create({ ...data, isActive: true });
    const newPayment = await this.repository.save(paymentToCreate);
    return this.transform(newPayment);
  }

  async updatePayment(
    id: string,
    data: IPaymentUpdate,
  ): Promise<PaymentSerializer | null> {
    const payment = await this.repository.findOneBy({ id, isActive: true });
    if (!payment) {
      return null;
    }
    await this.repository.update(id, data);
    const updatedPayment = await this.repository.findOneBy({ id });
    return updatedPayment ? this.transform(updatedPayment) : null;
  }

  async deletePayment(id: string): Promise<boolean> {
    const payment = await this.repository.findOneBy({ id, isActive: true });
    if (!payment) {
      return false;
    }
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  async paginate(
    options: IPaginationOptions = {},
    relations: string[] = [],
    customWhere?: FindOptionsWhere<Payment>,
  ): Promise<IPaginatedResult<PaymentSerializer>> {
    const defaultWhere: FindOptionsWhere<Payment> = {
      isActive: true,
      ...customWhere,
    };
    return super.paginate(options, relations, defaultWhere);
  }
}
