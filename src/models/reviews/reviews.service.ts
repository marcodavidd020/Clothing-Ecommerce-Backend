import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ReviewSerializer } from './serializers/review.serializer';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';
import { OrdersRepository } from '../orders/repositories/orders.repository'; // Para validar el order item
import {
  createNotFoundResponse,
  createErrorResponse,
} from 'src/common/helpers/responses/error.helper';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly ordersRepository: OrdersRepository, // Para validar que el item pertenece al usuario
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ReviewSerializer> {
    // 1. Validar que el orderItem existe y pertenece a una orden del usuario
    const orderItem = await this.ordersRepository.findOrderItemById(
      createReviewDto.orderItemId,
    );
    if (!orderItem) {
      throw new NotFoundException(
        'El item de la orden especificado no existe.',
      );
    }

    const order = await this.ordersRepository.findRawByIdWithItems(
      orderItem.order_id,
    );
    if (!order || order.user_id !== userId) {
      throw new ForbiddenException(
        'No puedes reseñar un item de una orden que no te pertenece.',
      );
    }

    // 2. Verificar si ya existe una reseña para este usuario y este item
    const existingReview =
      await this.reviewsRepository.findByUserIdAndOrderItemId(
        userId,
        createReviewDto.orderItemId,
      );
    if (existingReview) {
      throw new ConflictException('Ya has enviado una reseña para este item.');
    }

    try {
      const review = await this.reviewsRepository.createReview({
        ...createReviewDto,
        userId,
      });
      this.logger.log(
        `Reseña creada: ${review.id} para el item ${createReviewDto.orderItemId}`,
      );
      return review;
    } catch (error) {
      this.logger.error(
        `Error al crear la reseña: ${error.message}`,
        error.stack,
      );
      throw new ConflictException(
        createErrorResponse('Error al crear la reseña.'),
      );
    }
  }

  async findAllByOrderItemId(
    orderItemId: string,
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ReviewSerializer>> {
    const result = await this.reviewsRepository.findByOrderItemId(
      orderItemId,
      options,
    );
    if (!Array.isArray(result) && result.data.length === 0) {
      // Considerar si NotFound es apropiado o un array vacío con paginación correcta
    }
    return result as IPaginatedResult<ReviewSerializer>;
  }

  async findAllByUserId(
    userId: string,
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ReviewSerializer>> {
    return this.reviewsRepository.findByUserId(userId, options) as Promise<
      IPaginatedResult<ReviewSerializer>
    >;
  }

  async findOneById(id: string): Promise<ReviewSerializer> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException(createNotFoundResponse('Reseña'));
    }
    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    requestingUserId: string,
  ): Promise<ReviewSerializer> {
    const review = await this.reviewsRepository.findRawById(id);
    if (!review) {
      throw new NotFoundException(createNotFoundResponse('Reseña'));
    }

    if (review.userId !== requestingUserId) {
      // Si llega aquí, significa que el usuario no es el dueño.
      // El controlador debe haber chequeado si tiene permiso de admin (e.g., UPDATE_ANY_REVIEW)
      // Si no lo tiene, el PermissionsGuard lo habría bloqueado.
      // Si lo tiene, se permite la actualización, incluyendo potencialmente isActive.
    } else {
      // Es el dueño, no puede modificar isActive directamente a través de este DTO.
      if (updateReviewDto.isActive !== undefined) {
        delete updateReviewDto.isActive;
      }
    }

    const updatedReview = await this.reviewsRepository.updateReview(
      id,
      updateReviewDto,
    );
    if (!updatedReview) {
      throw new NotFoundException(
        createNotFoundResponse('Reseña al actualizar'),
      );
    }
    this.logger.log(`Reseña actualizada: ${id}`);
    return updatedReview;
  }

  async remove(id: string, requestingUserId: string): Promise<void> {
    const review = await this.reviewsRepository.findRawById(id);
    if (!review) {
      throw new NotFoundException(createNotFoundResponse('Reseña'));
    }

    if (review.userId !== requestingUserId) {
      // Si no es el dueño y llega aquí, el PermissionsGuard debe haber permitido por un permiso de admin (DELETE_ANY_REVIEW)
    }

    const success = await this.reviewsRepository.deleteReview(id); // Soft delete
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Reseña al eliminar'));
    }
    this.logger.log(`Reseña eliminada (lógicamente): ${id}`);
  }

  async hardRemoveAdmin(id: string): Promise<void> {
    const success = await this.reviewsRepository.hardDeleteReview(id);
    if (!success) {
      throw new NotFoundException(
        createNotFoundResponse('Reseña para eliminación física'),
      );
    }
    this.logger.log(`Reseña eliminada físicamente (admin): ${id}`);
  }

  async findAllPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<ReviewSerializer>> {
    return this.reviewsRepository.paginateAll(options);
  }
}
