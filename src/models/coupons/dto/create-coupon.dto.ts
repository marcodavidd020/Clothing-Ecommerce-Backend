import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  IsDate,
  MaxLength,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponDiscountTypeEnum } from '../constants/coupon.enums';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Código único del cupón',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Tipo de descuento del cupón',
    enum: CouponDiscountTypeEnum,
    example: CouponDiscountTypeEnum.PERCENTAGE,
  })
  @IsNotEmpty()
  @IsEnum(CouponDiscountTypeEnum)
  discountType: CouponDiscountTypeEnum;

  @ApiProperty({
    example: 10.5,
    description: 'Valor del descuento (porcentaje o monto fijo)',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  discountValue: number;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Monto mínimo de compra para aplicar el cupón',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  minAmount?: number = 0;

  @ApiPropertyOptional({
    example: 100,
    description: 'Número máximo de veces que se puede usar el cupón',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number | null;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del cupón',
    example: '2024-12-31T23:59:59.000Z',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Indica si el cupón está activo',
    default: true,
  })
  @IsOptional()
  isActive?: boolean = true;
}
