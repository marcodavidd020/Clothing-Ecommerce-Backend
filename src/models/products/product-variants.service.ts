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
    const variants = await this.variantsRepository.findByProductId(productId);
    return variants.map((v) => this.transformToSerializer(v));
  }

  async findById(id: string): Promise<ProductVariantSerializer> {
    const variantEntity = await this.variantsRepository.findById(id);
    if (!variantEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return this.transformToSerializer(variantEntity);
  }

  async create(
    variantData: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer> {
    const createdEntity = await this.variantsRepository.create(variantData);
    return this.transformToSerializer(createdEntity);
  }

  async update(
    id: string,
    variantData: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer> {
    const variantEntity = await this.variantsRepository.findById(id);
    if (!variantEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    const updatedEntity = await this.variantsRepository.update(id, variantData);
    if (!updatedEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Variante de producto'),
      );
    }
    return this.transformToSerializer(updatedEntity);
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
    const variantEntity = await this.variantsRepository.findById(variantId);
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
    const variantEntity = await this.variantsRepository.findById(variantId);
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
    const variantEntity = await this.variantsRepository.findById(variantId);
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
