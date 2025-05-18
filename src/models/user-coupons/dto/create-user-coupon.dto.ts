import { IsNotEmpty, IsUUID, IsOptional, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserCouponDto {
  @ApiProperty({
    description: 'ID del usuario al que se asigna el cupón',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID del cupón que se asigna',
    example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  couponId: string;

  @ApiPropertyOptional({
    description: 'Fecha en que se usó el cupón (si se registra al crear)',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  usedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Indica si la asignación del cupón está activa',
    default: true,
  })
  @IsOptional()
  isActive?: boolean = true;
} 