import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsSeederService } from './reviews.seeder.service';
import { Review } from '../../../models/reviews/entities/review.entity';
import { User } from '../../../models/users/entities/user.entity';
import { OrderItem } from '../../../models/orders/entities/order-item.entity';
import { Order } from '../../../models/orders/entities/order.entity'; // Necesario para encontrar órdenes de usuarios

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      User,
      OrderItem,
      Order, // Asegurar que Order está disponible para buscar items de órdenes de usuarios
    ]),
  ],
  providers: [ReviewsSeederService],
  exports: [ReviewsSeederService],
})
export class ReviewsSeederModule {}
