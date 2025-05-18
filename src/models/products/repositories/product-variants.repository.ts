import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ModelRepository } from '../../common/repositories/model.repository';
import { ProductVariantSerializer } from '../serializers/product-variant.serializer';

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

  async findRawById(id: string): Promise<ProductVariant | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  async findById(id: string): Promise<ProductVariantSerializer | null> {
    const entity = await this.repository.findOne({ where: { id, isActive: true } });
    return entity ? this.transform(entity) : null;
  }

  async findByProductId(productId: string): Promise<ProductVariantSerializer[]> {
    const entities = await this.repository.find({ where: { productId, isActive: true } });
    return this.transformMany(entities);
  }

  async create(
    data: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer> {
    const variantData = { ...data, isActive: true };
    const newVariant = this.repository.create(variantData);
    const savedEntity = await this.repository.save(newVariant);
    return this.transform(savedEntity);
  }

  async update(
    id: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer | null> {
    await this.repository.update(id, data);
    const updatedEntity = await this.repository.findOne({ where: { id, isActive: true } });
    return updatedEntity ? this.transform(updatedEntity) : null;
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  async deactivateByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.update(
      { productId, isActive: true },
      { isActive: false },
    );
    return result.affected ? result.affected > 0 : false;
  }

  async deleteByProductId(productId: string): Promise<boolean> {
    const result = await this.repository.delete({ productId });
    return result.affected ? result.affected > 0 : false;
  }

  async save(entity: ProductVariant): Promise<ProductVariant> {
    return this.repository.save(entity);
  }
}
