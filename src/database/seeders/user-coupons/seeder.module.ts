import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCoupon } from '../../../models/user-coupons/entities/user-coupon.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { UserCouponsSeederService } from './user-coupons.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([UserCoupon, User, Coupon])],
  providers: [UserCouponsSeederService],
  exports: [UserCouponsSeederService],
})
export class UserCouponsSeederModule {}
