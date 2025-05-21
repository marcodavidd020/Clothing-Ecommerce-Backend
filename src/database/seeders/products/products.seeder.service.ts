import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../../../models/products/entities/product.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';
import { ProductImage } from '../../../models/products/entities/product-image.entity';
import { Category } from '../../../models/categories/entities/category.entity';
import { productFactory } from '../../factories/products/factory';
import { productVariantFactory } from '../../factories/products/variant-factory';
import { productImageFactory } from '../../factories/products/image-factory';
import { faker } from '@faker-js/faker';
import { Seeder } from '../seeder.interface';

@Injectable()
export class ProductsSeederService implements Seeder {
  private readonly logger = new Logger(ProductsSeederService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log('Iniciando siembra de productos...');
    try {
      const count = await this.productRepository.count();
      if (count > 0) {
        this.logger.log('Los productos ya están creados, saltando seeder...');
        return;
      }

      const categories = await this.categoryRepository.find();
      this.logger.log(
        `Encontradas ${categories.length} categorías para asignar a productos.`,
      );

      if (categories.length === 0) {
        this.logger.warn(
          'No se encontraron categorías. Los productos se crearán sin categorías.',
        );
      }

      const NUM_PRODUCTS_TO_SEED = 20;
      this.logger.log(`Creando ${NUM_PRODUCTS_TO_SEED} productos...`);

      // Guardar productos por lotes para mejor rendimiento
      const productBatch: Product[] = [];

      for (let i = 0; i < NUM_PRODUCTS_TO_SEED; i++) {
        const productName = faker.commerce.productName();
        const productDataOverrides: Partial<Product> = {
          name: productName,
        };

        const productInstance = productFactory.generate(productDataOverrides);

        if (categories.length > 0) {
          const numCategories = faker.number.int({
            min: 1,
            max: Math.min(3, categories.length),
          });

          productInstance.categories = faker.helpers.arrayElements(
            categories,
            numCategories,
          );

          this.logger.debug(
            `Producto "${productName}" asignado a ${numCategories} categorías.`,
          );
        } else {
          productInstance.categories = [];
        }

        productBatch.push(productInstance);
      }

      const savedProducts = await this.productRepository.save(productBatch);
      this.logger.log(
        `${savedProducts.length} productos creados exitosamente.`,
      );

      for (const savedProduct of savedProducts) {
        const numVariants = faker.number.int({ min: 1, max: 3 });
        const variants = productVariantFactory.generateMany(
          savedProduct,
          numVariants,
        );
        await this.variantRepository.save(variants);

        const numImages = faker.number.int({ min: 2, max: 4 });
        const images = productImageFactory.generateMany(
          savedProduct,
          numImages,
        );
        await this.imageRepository.save(images);

        this.logger.log(
          `Producto "${savedProduct.name}" (ID: ${savedProduct.id}): ` +
            `${variants.length} variantes, ${images.length} imágenes, ` +
            `${savedProduct.categories?.length || 0} categorías.`,
        );
      }

      this.logger.log('Proceso de siembra de productos completado.');
    } catch (error) {
      this.logger.error('Error durante la siembra de productos:', error.stack);
    }
  }
}
