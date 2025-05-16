import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImagesRepository } from './repositories/product-images.repository';
import { ProductImageSerializer } from './serializers/product-image.serializer';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import { IProductImagesService } from './interfaces/product-image.interface';

@Injectable()
export class ProductImagesService implements IProductImagesService {
  constructor(private readonly imagesRepository: ProductImagesRepository) {}

  async findByProductId(productId: string): Promise<ProductImageSerializer[]> {
    return this.imagesRepository.findByProductId(productId);
  }

  async findById(id: string): Promise<ProductImageSerializer> {
    const image = await this.imagesRepository.findById(id);
    if (!image) {
      throw new NotFoundException(createNotFoundResponse('Imagen de producto'));
    }
    return image;
  }

  async create(
    imageData: CreateProductImageDto & { productId: string },
  ): Promise<ProductImageSerializer> {
    return this.imagesRepository.create(imageData);
  }

  async update(
    id: string,
    imageData: UpdateProductImageDto,
  ): Promise<ProductImageSerializer> {
    const updatedImage = await this.imagesRepository.update(id, imageData);
    if (!updatedImage) {
      throw new NotFoundException(createNotFoundResponse('Imagen de producto'));
    }
    return updatedImage;
  }

  async delete(id: string): Promise<void> {
    const success = await this.imagesRepository.delete(id);
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Imagen de producto'));
    }
  }
}
