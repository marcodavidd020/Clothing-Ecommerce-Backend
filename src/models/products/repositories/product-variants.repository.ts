import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto';
import { ModelRepository } from '../../common/repositories/model.repository';

@Injectable()
export class ProductVariantsRepository extends ModelRepository<
  ProductVariant,
  ProductVariant
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(ProductVariant);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(ProductVariant);
  }

  async findById(id: string): Promise<ProductVariant | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  async findByProductId(productId: string): Promise<ProductVariant[]> {
    return this.repository.find({ where: { productId, isActive: true } });
  }

  async create(
    data: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariant> {
    const variantData = { ...data, isActive: true };
    const newVariant = this.repository.create(variantData);
    return this.repository.save(newVariant);
  }

  async update(
    id: string,
    data: UpdateProductVariantDto,
  ): Promise<ProductVariant | null> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id, isActive: true } });
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
