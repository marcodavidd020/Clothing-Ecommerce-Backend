import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CouponsRepository } from './repositories/coupons.repository';
import { Coupon } from './entities/coupon.entity';
import { UserCouponsModule } from '../user-coupons/user-coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon]),
    forwardRef(() => UserCouponsModule), // Descomentar si CouponsService necesita UserCouponsRepository
  ],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository],
  exports: [CouponsService, CouponsRepository],
})
export class CouponsModule {}
