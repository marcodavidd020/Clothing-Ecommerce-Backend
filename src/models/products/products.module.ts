import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repositories/products.repository';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductImagesRepository } from './repositories/product-images.repository';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductVariantsService } from './product-variants.service';
import { ProductImagesService } from './product-images.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductImagesController } from './product-images.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      Category, // Necesario para las relaciones con categorías
    ]),
  ],
  controllers: [
    ProductsController,
    ProductVariantsController,
    ProductImagesController,
  ],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductVariantsService,
    ProductVariantsRepository,
    ProductImagesService,
    ProductImagesRepository,
  ],
  exports: [ProductsService, ProductVariantsService, ProductImagesService],
})
export class ProductsModule {}
