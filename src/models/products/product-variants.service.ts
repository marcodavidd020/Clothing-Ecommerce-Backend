import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductVariantSerializer } from './serializers/product-variant.serializer';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import { IProductVariantsService } from './interfaces/product-variant.interface';

@Injectable()
export class ProductVariantsService implements IProductVariantsService {
  constructor(private readonly variantsRepository: ProductVariantsRepository) {}

  async findByProductId(
    productId: string,
  ): Promise<ProductVariantSerializer[]> {
    return this.variantsRepository.findByProductId(productId);
  }

  async findById(id: string): Promise<ProductVariantSerializer> {
    const variant = await this.variantsRepository.findById(id);
    if (!variant) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return variant;
  }

  async create(
    variantData: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer> {
    return this.variantsRepository.create(variantData);
  }

  async update(
    id: string,
    variantData: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer> {
    const updatedVariant = await this.variantsRepository.update(
      id,
      variantData,
    );
    if (!updatedVariant) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return updatedVariant;
  }

  async delete(id: string): Promise<void> {
    const success = await this.variantsRepository.delete(id);
    if (!success) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
  }
}
