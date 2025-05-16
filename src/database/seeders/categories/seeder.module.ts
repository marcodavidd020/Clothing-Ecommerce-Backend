import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesSeederService } from './categories.seeder'; // Importar el servicio seeder
import { Category } from '../../../models/categories/entities/category.entity'; // Importar la entidad

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      // Si TypeORM requiere las tablas auxiliares del closure tree aquí, añadirlas
    ]),
  ],
  providers: [CategoriesSeederService],
  exports: [CategoriesSeederService],
})
export class CategoriesSeederModule {}
