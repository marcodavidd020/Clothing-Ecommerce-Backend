import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from '../../common/serializers/model.serializer';
import { Review } from '../entities/review.entity';
import { UserSerializer } from '../../users/serializers/user.serializer';
import { OrderItemSerializer } from '../../orders/serializers/order-item.serializer';

export class ReviewSerializer extends ModelSerializer {
  @ApiProperty({
    description: 'ID de la reseña.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'ID del usuario que escribió la reseña.',
    example: 'b2c3d4e5-f6g7-8901-2345-67890abcdeff',
  })
  @Expose()
  userId: string;

  @ApiPropertyOptional({
    description: 'Datos del usuario que escribió la reseña.',
    type: () => UserSerializer,
  })
  @Expose()
  @Type(() => UserSerializer)
  user?: UserSerializer;

  @ApiProperty({
    description: 'ID del item de la orden reseñado.',
    example: 'c3d4e5f6-g7h8-9012-3456-7890abcdef01',
  })
  @Expose()
  orderItemId: string;

  @ApiPropertyOptional({
    description: 'Datos del item de la orden reseñado.',
    type: () => OrderItemSerializer,
  })
  @Expose()
  @Type(() => OrderItemSerializer)
  orderItem?: OrderItemSerializer;

  @ApiProperty({
    description: 'Calificación otorgada (1-5).',
    example: 5,
  })
  @Expose()
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentario de la reseña.',
    example: '¡Muy buen producto!',
    nullable: true,
  })
  @Expose()
  comment: string | null;

  @ApiProperty({
    description: 'Indica si la reseña está activa (visible).',
    example: true,
  })
  @Expose()
  isActive: boolean;

  constructor(partial: Partial<Review>) {
    super(partial);
    Object.assign(this, partial);
    // El serializador de User y OrderItem se encargará de sus propios campos.
  }
}
