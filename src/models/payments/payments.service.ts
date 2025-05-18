import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentSerializer } from './serializers/payment.serializer';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatusEnum } from './constants/payment.enums';
import {
  createNotFoundResponse,
  createErrorResponse,
} from 'src/common/helpers/responses/error.helper';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';
import { EntityManager } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async findAllPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<PaymentSerializer>> {
    // El repositorio ya filtra por isActive: true en su método paginate
    return this.paymentsRepository.paginate(options);
  }

  async findById(id: string): Promise<PaymentSerializer> {
    const payment = await this.paymentsRepository.findById(id); // Ya filtra por isActive: true
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    return payment;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentSerializer | null> {
    // Ya filtra por isActive: true
    return this.paymentsRepository.findByTransactionId(transactionId);
  }

  async initiatePayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentSerializer> {
    try {
      // El repositorio se encarga de establecer isActive: true
      const payment = await this.paymentsRepository.createPayment({
        ...createPaymentDto,
        status: createPaymentDto.status || PaymentStatusEnum.PENDING,
      });
      this.logger.log(`Pago iniciado: ${payment.id}`);
      return payment;
    } catch (error) {
      this.logger.error(
        `Error al iniciar el pago: ${error.message}`,
        error.stack,
      );
      throw new ConflictException(
        createErrorResponse('Error al iniciar el pago'),
      );
    }
  }

  async confirmPayment(
    id: string,
    transactionId: string,
  ): Promise<PaymentSerializer> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity || !paymentEntity.isActive) {
      // <<< Verificación añadida
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }

    try {
      paymentEntity.confirm(transactionId);
      const updatedPayment = await this.paymentsRepository.updatePayment(
        paymentEntity.id,
        {
          status: paymentEntity.status,
          transactionId: paymentEntity.transactionId,
        },
      );
      if (!updatedPayment)
        // No debería pasar si findRawById encontró algo activo y se actualizó
        throw new NotFoundException(
          createNotFoundResponse('Pago al actualizar'),
        );
      this.logger.log(`Pago confirmado: ${id}, Transacción: ${transactionId}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al confirmar el pago ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async cancelPayment(id: string): Promise<PaymentSerializer> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity || !paymentEntity.isActive) {
      // <<< Verificación añadida
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    try {
      paymentEntity.cancel();
      const updatedPayment = await this.paymentsRepository.updatePayment(
        paymentEntity.id,
        { status: paymentEntity.status },
      );
      if (!updatedPayment)
        throw new NotFoundException(
          createNotFoundResponse('Pago al actualizar'),
        );
      this.logger.log(`Pago cancelado: ${id}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al cancelar el pago ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async failPayment(id: string): Promise<PaymentSerializer> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity || !paymentEntity.isActive) {
      // <<< Verificación añadida
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    try {
      paymentEntity.fail();
      const updatedPayment = await this.paymentsRepository.updatePayment(
        paymentEntity.id,
        { status: paymentEntity.status },
      );
      if (!updatedPayment)
        throw new NotFoundException(
          createNotFoundResponse('Pago al actualizar'),
        );
      this.logger.log(`Pago marcado como fallido: ${id}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al marcar el pago ${id} como fallido: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async refundPayment(id: string): Promise<PaymentSerializer> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity || !paymentEntity.isActive) {
      // <<< Verificación añadida
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }

    try {
      paymentEntity.refund();
      const updatedPayment = await this.paymentsRepository.updatePayment(
        paymentEntity.id,
        { status: paymentEntity.status },
      );
      if (!updatedPayment)
        throw new NotFoundException(
          createNotFoundResponse('Pago al actualizar'),
        );
      this.logger.log(`Pago reembolsado: ${id}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al reembolsar el pago ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async isPaymentSuccessful(id: string): Promise<boolean> {
    const payment = await this.findById(id); // findById ya lanza NotFound si no está activo
    return payment.status === PaymentStatusEnum.PAID;
  }

  async getPaymentReceipt(
    id: string,
  ): Promise<{ id: string; amount: number; status: string; date: Date }> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity || !paymentEntity.isActive) {
      // <<< Verificación añadida
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    return paymentEntity.getReceipt();
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentSerializer> {
    // El método updatePayment del repositorio ya verifica si está activo antes de actualizar
    const payment = await this.paymentsRepository.updatePayment(
      id,
      updatePaymentDto,
    );
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    this.logger.log(`Pago actualizado: ${id}`);
    return payment;
  }

  async delete(id: string): Promise<void> {
    const success = await this.paymentsRepository.deletePayment(id); // deletePayment ahora hace soft delete
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    this.logger.log(`Pago eliminado (lógicamente): ${id}`);
  }

  // --- Métodos Internos para Transacciones ---

  async initiatePaymentInternal(
    createPaymentDto: CreatePaymentDto,
    manager: EntityManager,
  ): Promise<Payment> {
    const paymentRepository = manager.getRepository(Payment);

    const paymentData = {
      ...createPaymentDto,
      status: createPaymentDto.status || PaymentStatusEnum.PENDING,
      isActive: true,
    };
    const payment = paymentRepository.create(paymentData);
    const savedPayment = await paymentRepository.save(payment);
    this.logger.log(`Pago (interno) iniciado: ${savedPayment.id}`);
    return savedPayment;
  }

  async confirmPaymentInternal(
    paymentId: string,
    transactionId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    const paymentRepository = manager.getRepository(Payment);

    const payment = await paymentRepository.findOneBy({
      id: paymentId,
      isActive: true,
    });
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago (interno)'));
    }
    try {
      payment.confirm(transactionId);
      const updatedPayment = await paymentRepository.save(payment);
      this.logger.log(
        `Pago (interno) confirmado: ${paymentId}, Transacción: ${transactionId}`,
      );
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al confirmar el pago (interno) ${paymentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async cancelPaymentInternal(
    paymentId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    const paymentRepository = manager.getRepository(Payment);

    const payment = await paymentRepository.findOneBy({
      id: paymentId,
      isActive: true,
    });
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago (interno)'));
    }
    try {
      payment.cancel();
      const updatedPayment = await paymentRepository.save(payment);
      this.logger.log(`Pago (interno) cancelado: ${paymentId}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al cancelar el pago (interno) ${paymentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }

  async refundPaymentInternal(
    paymentId: string,
    manager: EntityManager,
  ): Promise<Payment> {
    const paymentRepository = manager.getRepository(Payment);

    const payment = await paymentRepository.findOneBy({
      id: paymentId,
      isActive: true,
    });
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago (interno)'));
    }
    try {
      payment.refund();
      const updatedPayment = await paymentRepository.save(payment);
      this.logger.log(`Pago (interno) reembolsado: ${paymentId}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(
        `Error al reembolsar el pago (interno) ${paymentId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }
}
