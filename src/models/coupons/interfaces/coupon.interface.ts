import { CouponDiscountTypeEnum } from '../constants/coupon.enums';

export interface ICoupon {
  id: string;
  code: string;
  discountType: CouponDiscountTypeEnum;
  discountValue: number;
  minAmount: number;
  maxUses: number | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponCreate {
  code: string;
  discountType: CouponDiscountTypeEnum;
  discountValue: number;
  minAmount?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}

export interface ICouponUpdate {
  code?: string;
  discountType?: CouponDiscountTypeEnum;
  discountValue?: number;
  minAmount?: number;
  maxUses?: number | null;
  expiresAt?: Date | null;
  isActive?: boolean;
}
