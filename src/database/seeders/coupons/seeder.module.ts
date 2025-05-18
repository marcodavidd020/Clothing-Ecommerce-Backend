import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { CouponsSeederService } from './coupons.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  providers: [CouponsSeederService],
  exports: [CouponsSeederService],
})
export class CouponsSeederModule {}
