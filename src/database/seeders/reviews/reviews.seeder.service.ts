import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { Review } from '../../../models/reviews/entities/review.entity';
import { User } from '../../../models/users/entities/user.entity';
import { OrderItem } from '../../../models/orders/entities/order-item.entity';
import { Order } from '../../../models/orders/entities/order.entity';
import { Seeder } from '../seeder.interface';

@Injectable()
export class ReviewsSeederService implements Seeder {
  private readonly logger = new Logger(ReviewsSeederService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log('Iniciando siembra de reseñas...');
    try {
      const reviewCount = await this.reviewRepository.count();
      const NUM_REVIEWS_TO_CREATE = 15;
      if (reviewCount >= NUM_REVIEWS_TO_CREATE) {
        this.logger.log('Ya existen suficientes reseñas, saltando seeder...');
        return;
      }

      const users = await this.userRepository.find({ take: 5 });
      if (users.length === 0) {
        this.logger.warn('No hay usuarios para crear reseñas. Saltando...');
        return;
      }

      // Obtener órdenes para estos usuarios
      const userIds = users.map((u) => u.id);
      const userOrders = await this.orderRepository.find({
        where: { user_id: In(userIds) },
        relations: ['items', 'items.productVariant'], // Cargar items y sus variantes
      });

      if (userOrders.length === 0) {
        this.logger.warn(
          'Los usuarios seleccionados no tienen órdenes. Saltando...',
        );
        return;
      }

      const orderItemsToReview: { orderItem: OrderItem; userId: string }[] = [];
      for (const order of userOrders) {
        for (const item of order.items) {
          // Asegurarse de que el item tenga un productVariant (podría ser null si se borró)
          // y que la orden tenga un user_id asignado
          if (item.productVariant && order.user_id) {
            orderItemsToReview.push({ orderItem: item, userId: order.user_id });
          }
        }
      }

      if (orderItemsToReview.length === 0) {
        this.logger.warn(
          'No hay items de órdenes válidos para reseñar. Saltando...',
        );
        return;
      }

      let createdCount = 0;
      for (let i = 0; i < NUM_REVIEWS_TO_CREATE; i++) {
        if (orderItemsToReview.length === 0) break; // No más items para reseñar

        const randomIndex = faker.number.int({
          min: 0,
          max: orderItemsToReview.length - 1,
        });
        const { orderItem, userId } = orderItemsToReview.splice(
          randomIndex,
          1,
        )[0]; // Tomar y remover uno al azar

        // Verificar si ya existe una reseña para este usuario y este item
        const existingReview = await this.reviewRepository.findOne({
          where: {
            userId: userId,
            orderItemId: orderItem.id,
          },
        });

        if (existingReview) {
          this.logger.log(
            `Ya existe una reseña para el item ${orderItem.id} por el usuario ${userId}. Saltando...`,
          );
          continue; // Saltar si ya existe
        }

        // Preparamos el payload para la reseña
        const reviewPayload: {
          userId: string;
          orderItemId: string;
          rating: number;
          comment?: string;
          isActive: boolean;
          productId?: string;
          productVariantId?: string;
        } = {
          userId: userId,
          orderItemId: orderItem.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          isActive: true,
        };

        // orderItem.productVariant se valida antes de agregar a orderItemsToReview.
        // Esta guarda es para robustez adicional y claridad.
        if (orderItem.productVariant) {
          // Asumimos que ProductVariant tiene 'productId' y 'id'.
          // Si 'productId' no está en productVariant, se necesitaría cargar productVariant.product.
          reviewPayload.productId = orderItem.productVariant.productId;
          reviewPayload.productVariantId = orderItem.productVariant.id;
        }

        const review = this.reviewRepository.create(reviewPayload as any); // Usamos 'as any' temporalmente para el linter.
        await this.reviewRepository.save(review);
        createdCount++;
      }

      this.logger.log(`Siembra de ${createdCount} reseñas completada.`);
    } catch (error) {
      this.logger.error('Error durante la siembra de reseñas:', error.stack);
    }
  }
}
