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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async findAllPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<PaymentSerializer>> {
    // Aquí podrías añadir filtros o relaciones si es necesario
    return this.paymentsRepository.paginate(options);
  }

  async findById(id: string): Promise<PaymentSerializer> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    return payment;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentSerializer | null> {
    return this.paymentsRepository.findByTransactionId(transactionId);
  }

  async initiatePayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentSerializer> {
    try {
      // Lógica de comunicación con el proveedor de pago iría aquí
      // Por ahora, solo creamos el registro en la BD
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
    if (!paymentEntity) {
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
    if (!paymentEntity) {
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
    if (!paymentEntity) {
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
    if (!paymentEntity) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }

    // Lógica de comunicación con el proveedor de pago para procesar el reembolso iría aquí
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
    const payment = await this.findById(id);
    return payment.status === PaymentStatusEnum.PAID;
  }

  async getPaymentReceipt(
    id: string,
  ): Promise<{ id: string; amount: number; status: string; date: Date }> {
    const paymentEntity = await this.paymentsRepository.findRawById(id);
    if (!paymentEntity) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    // Aquí se podría formatear más la información o incluir más detalles
    return paymentEntity.getReceipt();
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentSerializer> {
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
    const success = await this.paymentsRepository.deletePayment(id);
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Pago'));
    }
    this.logger.log(`Pago eliminado: ${id}`);
  }
}
