import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesSeederService } from './categories.seeder.service'; // Importar el servicio seeder
import { Category } from '../../../models/categories/entities/category.entity'; // Importar la entidad

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
    ]),
  ],
  providers: [CategoriesSeederService],
  exports: [CategoriesSeederService],
})
export class CategoriesSeederModule {}
