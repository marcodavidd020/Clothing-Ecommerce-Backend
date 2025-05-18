import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { PaymentFactory } from '../../factories/payments/factory';
import { Seeder } from '../seeder.interface';

@Injectable()
export class PaymentsSeederService implements Seeder {
  private readonly logger = new Logger(PaymentsSeederService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    // @InjectRepository(User) // Descomenta si necesitas el repositorio de User
    // private readonly usersRepository: Repository<User>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    const numberOfPaymentsToCreate = 10; // O el número que desees

    const existingPaymentsCount = await this.paymentsRepository.count();
    if (existingPaymentsCount >= numberOfPaymentsToCreate) {
      this.logger.log(
        `Ya existen suficientes pagos (${existingPaymentsCount}). No se crearán nuevos.`,
      );
      return;
    }

    this.logger.log(`Creando ${numberOfPaymentsToCreate} pagos de ejemplo...`);

    // Si necesitas asociar a usuarios, primero obtenlos:
    // const users = await this.usersRepository.find({ take: 5 }); // Tomar algunos usuarios
    // if (!users.length) {
    //   this.logger.warn('No hay usuarios para asociar pagos. Creando pagos sin asociación.');
    // }

    const paymentsData = PaymentFactory.generateMany(numberOfPaymentsToCreate);

    for (const paymentData of paymentsData) {
      // Si asocias con usuario y tu entidad Payment tiene un campo `userId` o una relación `user`
      // if (users.length) {
      //   const randomUser = users[Math.floor(Math.random() * users.length)];
      //   // paymentData.userId = randomUser.id; // Si es un campo userId
      //   // paymentData.user = randomUser; // Si es una relación de entidad
      // }

      const payment = this.paymentsRepository.create(paymentData);
      await this.paymentsRepository.save(payment);
    }

    this.logger.log(`${numberOfPaymentsToCreate} pagos creados exitosamente.`);
  }
}
