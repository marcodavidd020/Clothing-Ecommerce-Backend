import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { Category } from './entities/category.entity';
// Importar validaciones personalizadas si las hay (aunque no hay en este caso para categorías)

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      // Aquí se incluirían las tablas auxiliares de closure tree si fuera necesario declararlas
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
