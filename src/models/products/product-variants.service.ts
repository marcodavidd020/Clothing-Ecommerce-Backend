import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductVariantSerializer } from './serializers/product-variant.serializer';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import { IProductVariantsService } from './interfaces/product-variant.interface';
import { ProductVariant } from './entities/product-variant.entity';
import { plainToInstance } from 'class-transformer';
import { AddVariantStockDto } from './dto/add-variant-stock.dto';
import { RemoveVariantStockDto } from './dto/remove-variant-stock.dto';
import { UpdateVariantDetailsDto } from './dto/update-variant-details.dto';

@Injectable()
export class ProductVariantsService implements IProductVariantsService {
  constructor(private readonly variantsRepository: ProductVariantsRepository) {}

  private transformToSerializer(
    variant: ProductVariant,
  ): ProductVariantSerializer {
    return plainToInstance(ProductVariantSerializer, variant, {
      excludeExtraneousValues: true,
    });
  }

  async findByProductId(
    productId: string,
  ): Promise<ProductVariantSerializer[]> {
    return this.variantsRepository.findByProductId(productId);
  }

  async findById(id: string): Promise<ProductVariantSerializer> {
    const variantSerializer = await this.variantsRepository.findById(id);
    if (!variantSerializer) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return variantSerializer;
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
    const updatedSerializer = await this.variantsRepository.update(id, variantData);
    if (!updatedSerializer) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return updatedSerializer;
  }

  async delete(id: string): Promise<void> {
    const success = await this.variantsRepository.deactivate(id);
    if (!success) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
  }

  async addStock(
    variantId: string,
    dto: AddVariantStockDto,
  ): Promise<ProductVariantSerializer> {
    const variantEntity = await this.variantsRepository.findRawById(variantId);
    if (!variantEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    try {
      variantEntity.addStock(dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedVariant = await this.variantsRepository.save(variantEntity);
    return this.transformToSerializer(savedVariant);
  }

  async removeStock(
    variantId: string,
    dto: RemoveVariantStockDto,
  ): Promise<ProductVariantSerializer> {
    const variantEntity = await this.variantsRepository.findRawById(variantId);
    if (!variantEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    try {
      variantEntity.removeStock(dto.amount);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedVariant = await this.variantsRepository.save(variantEntity);
    return this.transformToSerializer(savedVariant);
  }

  async updateDetails(
    variantId: string,
    dto: UpdateVariantDetailsDto,
  ): Promise<ProductVariantSerializer> {
    const variantEntity = await this.variantsRepository.findRawById(variantId);
    if (!variantEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    try {
      variantEntity.updateDetails(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const savedVariant = await this.variantsRepository.save(variantEntity);
    return this.transformToSerializer(savedVariant);
  }
}
