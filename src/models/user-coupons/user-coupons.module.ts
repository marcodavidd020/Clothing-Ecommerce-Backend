import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCoupon } from './entities/user-coupon.entity';
import { UserCouponsController } from './user-coupons.controller';
import { UserCouponsService } from './user-coupons.service';
import { UserCouponsRepository } from './repositories/user-coupons.repository';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCoupon]),
    forwardRef(() => UsersModule), // Si UserCouponsService/Repository inyecta UsersService/Repository
    forwardRef(() => CouponsModule), // Si UserCouponsService/Repository inyecta CouponsService/Repository
  ],
  controllers: [UserCouponsController],
  providers: [UserCouponsService, UserCouponsRepository],
  exports: [UserCouponsService, UserCouponsRepository],
})
export class UserCouponsModule {}
