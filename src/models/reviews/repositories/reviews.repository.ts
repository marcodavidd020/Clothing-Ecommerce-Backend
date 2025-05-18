import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Review } from '../entities/review.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { ReviewSerializer } from '../serializers/review.serializer';
import { IReviewCreate, IReviewUpdate } from '../interfaces/review.interface';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class ReviewsRepository extends ModelRepository<
  Review,
  ReviewSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(ReviewSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Review);
    this.metadata = this.repository.metadata;
  }

  private getDefaultRelations(): string[] {
    return [
      'user',
      'orderItem',
      'orderItem.productVariant',
      'orderItem.productVariant.product',
    ];
  }

  async findById(id: string): Promise<ReviewSerializer | null> {
    const review = await this.repository.findOne({
      where: { id, isActive: true },
      relations: this.getDefaultRelations(),
    });
    return review ? this.transform(review) : null;
  }

  async findRawById(id: string): Promise<Review | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: this.getDefaultRelations(),
    });
  }

  async findByOrderItemId(
    orderItemId: string,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<ReviewSerializer> | ReviewSerializer[]> {
    const where: FindOptionsWhere<Review> = { orderItemId, isActive: true };
    if (options && (options.page || options.limit)) {
      return this.paginateBy(where, options, this.getDefaultRelations());
    }
    const reviews = await this.repository.find({
      where,
      relations: this.getDefaultRelations(),
      order: { createdAt: 'DESC' },
    });
    return this.transformMany(reviews);
  }

  async findByUserId(
    userId: string,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<ReviewSerializer> | ReviewSerializer[]> {
    const where: FindOptionsWhere<Review> = { userId, isActive: true };
    if (options && (options.page || options.limit)) {
      return this.paginateBy(where, options, this.getDefaultRelations());
    }
    const reviews = await this.repository.find({
      where,
      relations: this.getDefaultRelations(),
      order: { createdAt: 'DESC' },
    });
    return this.transformMany(reviews);
  }

  async findByUserIdAndOrderItemId(
    userId: string,
    orderItemId: string,
  ): Promise<ReviewSerializer | null> {
    const review = await this.repository.findOne({
      where: { userId, orderItemId, isActive: true },
      relations: this.getDefaultRelations(),
    });
    return review ? this.transform(review) : null;
  }

  async createReview(
    data: IReviewCreate & { userId: string },
  ): Promise<ReviewSerializer> {
    const reviewToCreate = this.repository.create({
      ...data,
      isActive: true,
    });
    const newReview = await this.repository.save(reviewToCreate);
    // Recargar para obtener relaciones
    const fullReview = await this.findRawById(newReview.id);
    return fullReview ? this.transform(fullReview) : this.transform(newReview);
  }

  async updateReview(
    id: string,
    data: IReviewUpdate,
  ): Promise<ReviewSerializer | null> {
    const review = await this.repository.findOneBy({ id, isActive: true });
    if (!review) {
      return null;
    }
    // Conservar isActive si no se pasa explícitamente
    const updateData = { ...data };
    if (data.isActive === undefined) {
      delete updateData.isActive;
    }

    await this.repository.update(id, updateData);
    const updatedReview = await this.findRawById(id);
    return updatedReview ? this.transform(updatedReview) : null;
  }

  async deleteReview(id: string): Promise<boolean> {
    // Soft delete
    const review = await this.repository.findOneBy({ id, isActive: true });
    if (!review) {
      return false;
    }
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  async hardDeleteReview(id: string): Promise<boolean> {
    // Hard delete
    const result = await this.repository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  async paginateAll(
    options: IPaginationOptions,
    customWhere?: FindOptionsWhere<Review>,
  ): Promise<IPaginatedResult<ReviewSerializer>> {
    const where: FindOptionsWhere<Review> = { isActive: true, ...customWhere };
    return super.paginate(options, this.getDefaultRelations(), where);
  }
}
