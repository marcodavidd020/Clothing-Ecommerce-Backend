import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ProductVariantSerializer } from '../serializers/product-variant.serializer';
import { ModelRepository } from '../../common/repositories/model.repository';

@Injectable()
export class ProductVariantsRepository extends ModelRepository<
  ProductVariant,
  ProductVariantSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(ProductVariantSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(ProductVariant);
  }

  async findById(id: string): Promise<ProductVariantSerializer | null> {
    return this.get(id);
  }

  async findByProductId(
    productId: string,
  ): Promise<ProductVariantSerializer[]> {
    return this.getAllBy({ productId });
  }

  async create(
    data: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer> {
    return this.createEntity(data);
  }

  async update(
    id: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer | null> {
    return this.updateEntity(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.delete({ productId });
    return result.affected ? result.affected > 0 : false;
  }
}
