import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { PaymentsSeederService } from './payments.seeder';
// Import User si lo usas en el seeder service
// import { User } from '../../../models/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      // User, // Descomenta si el servicio de seeder inyecta UserRepository
    ]),
  ],
  providers: [PaymentsSeederService],
  exports: [PaymentsSeederService],
})
export class PaymentsSeederModule {}
