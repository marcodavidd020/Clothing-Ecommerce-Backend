import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Coupon } from '../entities/coupon.entity';
import { CouponDiscountTypeEnum } from '../constants/coupon.enums';

export class CouponSerializer extends ModelSerializer {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Código único del cupón',
  })
  @Expose()
  code: string;

  @ApiProperty({
    description: 'Tipo de descuento del cupón',
    enum: CouponDiscountTypeEnum,
    example: CouponDiscountTypeEnum.PERCENTAGE,
  })
  @Expose()
  discountType: CouponDiscountTypeEnum;

  @ApiProperty({
    example: 10.5,
    description: 'Valor del descuento',
  })
  @Expose()
  discountValue: number;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Monto mínimo de compra para aplicar el cupón',
  })
  @Expose()
  minAmount: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Número máximo de veces que se puede usar el cupón',
    nullable: true,
  })
  @Expose()
  maxUses: number | null;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del cupón',
    example: '2024-12-31T23:59:59.000Z',
    type: Date,
    nullable: true,
  })
  @Expose()
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Indica si el cupón está activo',
    example: true,
  })
  @Expose()
  isActive: boolean;

  constructor(partial: Partial<Coupon>) {
    super(partial);
    Object.assign(this, partial);
  }
}
