import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesSeederService } from './categories.seeder.service'; // Importar el servicio seeder
import { Category } from '../../../models/categories/entities/category.entity'; // Importar la entidad
import { Product } from '../../../models/products/entities/product.entity'; // Importar Product para la relación

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
    ]),
  ],
  providers: [CategoriesSeederService],
  exports: [CategoriesSeederService],
})
export class CategoriesSeederModule {}
