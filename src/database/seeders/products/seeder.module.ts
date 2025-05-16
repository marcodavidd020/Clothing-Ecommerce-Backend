import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsSeederService } from './products.seeder';
import { Product } from '../../../models/products/entities/product.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';
import { ProductImage } from '../../../models/products/entities/product-image.entity';
import { Category } from '../../../models/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      Category,
    ]),
  ],
  providers: [ProductsSeederService],
  exports: [ProductsSeederService],
})
export class ProductsSeederModule {} 