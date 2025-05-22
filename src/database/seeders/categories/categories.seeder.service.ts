import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, TreeRepository } from 'typeorm';
import { Category } from '../../../models/categories/entities/category.entity';
import { categoryFactory } from '../../factories/categories/factory';
import { Seeder } from '../seeder.interface';

@Injectable()
export class CategoriesSeederService implements Seeder {
  private readonly logger = new Logger(CategoriesSeederService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log('Iniciando siembra de categorías...');
    try {
      const count = await this.categoryRepository.count();
      if (count > 0) {
        this.logger.log('Las categorías ya están creadas, saltando seeder...');
        return;
      }

      this.logger.log('Creando categorías raíz...');
      // Categorías principales
      const ropaData = categoryFactory.generate({
        name: 'Ropa',
        slug: 'ropa',
        image:
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
      });
      const accesoriosData = categoryFactory.generate({
        name: 'Accesorios',
        slug: 'accesorios',
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      });

      const savedRopa = await this.categoryRepository.save(ropaData);
      const savedAccesorios =
        await this.categoryRepository.save(accesoriosData);
      this.logger.log('Categorías raíz sembradas');

      this.logger.log('Creando subcategorías de ropa...');
      // Subcategorías de ropa
      const ropaHombreData = categoryFactory.generate({
        name: 'Hombre',
        slug: 'ropa-hombre',
        parent: savedRopa,
        image:
          'https://res.cloudinary.com/dg2ugi96k/image/upload/v1747863717/ropa-man_f1k5y6.png',
      });
      const ropaMujerData = categoryFactory.generate({
        name: 'Mujer',
        slug: 'ropa-mujer',
        parent: savedRopa,
        image:
          'https://res.cloudinary.com/dg2ugi96k/image/upload/v1747902712/ropa-woman_anqyvl.png',
      });
      const ropaNinoData = categoryFactory.generate({
        name: 'Niño',
        slug: 'ropa-nino',
        parent: savedRopa,
        image:
          'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
      });

      const savedRopaHombre =
        await this.categoryRepository.save(ropaHombreData);
      const savedRopaMujer = await this.categoryRepository.save(ropaMujerData);
      const savedRopaNino = await this.categoryRepository.save(ropaNinoData);

      this.logger.log('Creando subcategorías de accesorios...');
      // Subcategorías de accesorios
      const bolsosData = categoryFactory.generate({
        name: 'Bolsos y Carteras',
        slug: 'bolsos-carteras',
        parent: savedAccesorios,
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      });
      const joyeriaData = categoryFactory.generate({
        name: 'Joyería',
        slug: 'joyeria',
        parent: savedAccesorios,
        image:
          'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800',
      });
      const relojesData = categoryFactory.generate({
        name: 'Relojes',
        slug: 'relojes',
        parent: savedAccesorios,
        image:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
      });

      await this.categoryRepository.save(bolsosData);
      await this.categoryRepository.save(joyeriaData);
      await this.categoryRepository.save(relojesData);

      this.logger.log('Creando sub-subcategorías de ropa de hombre...');
      // Sub-subcategorías de ropa de hombre
      const camisasHombreData = categoryFactory.generate({
        name: 'Camisas',
        slug: 'camisas-hombre',
        parent: savedRopaHombre,
        image:
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
      });
      const pantalonesHombreData = categoryFactory.generate({
        name: 'Pantalones',
        slug: 'pantalones-hombre',
        parent: savedRopaHombre,
        image:
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      });
      const chaquetasHombreData = categoryFactory.generate({
        name: 'Chaquetas',
        slug: 'chaquetas-hombre',
        parent: savedRopaHombre,
        image:
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      });

      await this.categoryRepository.save(camisasHombreData);
      await this.categoryRepository.save(pantalonesHombreData);
      await this.categoryRepository.save(chaquetasHombreData);

      this.logger.log('Creando sub-subcategorías de ropa de mujer...');
      // Sub-subcategorías de ropa de mujer
      const vestidosData = categoryFactory.generate({
        name: 'Vestidos',
        slug: 'vestidos',
        parent: savedRopaMujer,
        image:
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800',
      });
      const blusasData = categoryFactory.generate({
        name: 'Blusas',
        slug: 'blusas',
        parent: savedRopaMujer,
        image:
          'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800',
      });
      const faldasData = categoryFactory.generate({
        name: 'Faldas',
        slug: 'faldas',
        parent: savedRopaMujer,
        image:
          'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      });

      await this.categoryRepository.save(vestidosData);
      await this.categoryRepository.save(blusasData);
      await this.categoryRepository.save(faldasData);

      this.logger.log('Proceso de siembra de categorías completado.');
    } catch (error) {
      this.logger.error('Error durante la siembra de categorías:', error.stack);
    }
  }
}
