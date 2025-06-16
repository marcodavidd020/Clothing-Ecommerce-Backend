import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductImage } from '../entities/product-image.entity';
import { CreateProductImageDto } from '../dto/create-product-image.dto';
import { UpdateProductImageDto } from '../dto/update-product-image.dto';
import { ProductImageSerializer } from '../serializers/product-image.serializer';
import { ModelRepository } from '../../common/repositories/model.repository';

@Injectable()
export class ProductImagesRepository extends ModelRepository<
  ProductImage,
  ProductImageSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(ProductImageSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(ProductImage);
  }

  async findById(id: string): Promise<ProductImageSerializer | null> {
    return this.getBy({ id, isActive: true } as any, [], false);
  }

  async findByProductId(productId: string): Promise<ProductImageSerializer[]> {
    return this.getAllBy({ productId, isActive: true });
  }

  async create(
    data: CreateProductImageDto & { productId: string },
  ): Promise<ProductImageSerializer> {
    const imageData = { ...data, isActive: true };
    return this.createEntity(imageData);
  }

  async update(
    id: string,
    data: UpdateProductImageDto,
  ): Promise<ProductImageSerializer | null> {
    return this.updateEntity(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  async deactivateByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.update(
      { productId },
      { isActive: false },
    );
    return result.affected ? result.affected > 0 : false;
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.delete({ productId });
    return result.affected ? result.affected > 0 : false;
  }
}
