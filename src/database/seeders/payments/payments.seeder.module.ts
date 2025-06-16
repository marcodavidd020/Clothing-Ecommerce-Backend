import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { PaymentsSeederService } from './payments.seeder.service';
// Import User si lo usas en el seeder service
// import { User } from '../../../models/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentsSeederService],
  exports: [PaymentsSeederService],
})
export class PaymentsSeederModule {}
