import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { UserCoupon } from '../entities/user-coupon.entity';
import { UserSerializer } from '../../users/serializers/user.serializer';
import { CouponSerializer } from '../../coupons/serializers/coupon.serializer';

export class UserCouponSerializer extends ModelSerializer {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Expose()
  userId: string;

  @ApiPropertyOptional({
    description: 'Datos del usuario',
    type: () => UserSerializer,
  })
  @Expose()
  @Type(() => UserSerializer)
  user?: UserSerializer;

  @ApiProperty({
    description: 'ID del cupón',
    example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
  })
  @Expose()
  couponId: string;

  @ApiPropertyOptional({
    description: 'Datos del cupón',
    type: () => CouponSerializer,
  })
  @Expose()
  @Type(() => CouponSerializer)
  coupon?: CouponSerializer;

  @ApiPropertyOptional({
    description: 'Fecha en que se usó el cupón',
    type: Date,
    nullable: true,
  })
  @Expose()
  usedAt: Date | null;

  @ApiProperty({
    description: 'Indica si la asignación del cupón está activa',
    example: true,
  })
  @Expose()
  isActive: boolean;

  constructor(partial: Partial<UserCoupon>) {
    super(partial);
    Object.assign(this, partial);
    // Para serializar relaciones, class-transformer se encarga si @Type está presente
    // y las propiedades user/coupon están en partial
  }
}
