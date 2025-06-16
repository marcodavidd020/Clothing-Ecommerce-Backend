import { PartialType } from '@nestjs/swagger';
import { CreateUserCouponDto } from './create-user-coupon.dto';

export class UpdateUserCouponDto extends PartialType(CreateUserCouponDto) {}
