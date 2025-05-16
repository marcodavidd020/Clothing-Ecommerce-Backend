import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Category } from '../../../models/categories/entities/category.entity';
import { categoryFactory } from '../../factories/categories/factory';

@Injectable()
export class CategoriesSeederService {
  private readonly logger = new Logger(CategoriesSeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Iniciando siembra de categorías...');
    try {
      const count = await this.categoryRepository.count();
      if (count > 0) {
        this.logger.log('Las categorías ya están creadas, saltando seeder...');
        return;
      }

      this.logger.log('Creando categorías raíz...');
      const electronicosData = categoryFactory.generate({ name: 'Electrónicos', slug: 'electronicos' });
      const ropaData = categoryFactory.generate({ name: 'Ropa y Accesorios', slug: 'ropa-y-accesorios' });
      const hogarData = categoryFactory.generate({ name: 'Hogar y Cocina', slug: 'hogar-y-cocina' });

      const savedElectronicos = await this.categoryRepository.save(electronicosData);
      const savedRopa = await this.categoryRepository.save(ropaData);
      const savedHogar = await this.categoryRepository.save(hogarData);
      this.logger.log('Categorías raíz sembradas:', [savedElectronicos, savedRopa, savedHogar].map(c=>c.id));

      this.logger.log('Creando subcategorías...');
      const smartphonesData = categoryFactory.generate({ name: 'Smartphones', slug: 'smartphones', parent: savedElectronicos });
      const laptopsData = categoryFactory.generate({ name: 'Laptops', slug: 'laptops', parent: savedElectronicos });
      const camisetasData = categoryFactory.generate({ name: 'Camisetas', slug: 'camisetas', parent: savedRopa });
      const pantalonesData = categoryFactory.generate({ name: 'Pantalones', slug: 'pantalones', parent: savedRopa });
      const mueblesData = categoryFactory.generate({ name: 'Muebles', slug: 'muebles', parent: savedHogar });
      
      const savedSmartphones = await this.categoryRepository.save(smartphonesData);
      await this.categoryRepository.save(laptopsData);
      await this.categoryRepository.save(camisetasData);
      await this.categoryRepository.save(pantalonesData);
      await this.categoryRepository.save(mueblesData);
      this.logger.log('Subcategorías sembradas.');

      this.logger.log('Creando sub-subcategoría...');
      if (savedSmartphones) {
          const fundasSmartphonesData = categoryFactory.generate({ name: 'Fundas de Smartphones', slug: 'fundas-smartphones', parent: savedSmartphones });
          await this.categoryRepository.save(fundasSmartphonesData);
          this.logger.log('Sub-subcategoría Fundas de Smartphones sembrada.');
      } else {
          this.logger.warn('No se encontró la categoría Smartphones guardada para crear sub-subcategoría.');
      }

      this.logger.log('Proceso de siembra de categorías completado.');
    } catch (error) {
      this.logger.error('Error durante la siembra de categorías:', error.stack);
    }
  }
} 