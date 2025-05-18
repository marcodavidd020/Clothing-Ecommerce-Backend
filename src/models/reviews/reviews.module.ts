import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { Review } from './entities/review.entity';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { OrderItem } from '../orders/entities/order-item.entity'; // Importar OrderItem para forFeature
import { User } from '../users/entities/user.entity'; // Importar User para forFeature

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, OrderItem, User]), // Asegurar que todas las entidades relacionadas directamente estén aquí
    forwardRef(() => UsersModule), // Necesario si UsersRepository es inyectado directamente
    forwardRef(() => OrdersModule), // Necesario para OrdersRepository
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
