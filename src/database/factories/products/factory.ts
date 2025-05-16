import { faker } from '@faker-js/faker';
import { Product } from '../../../models/products/entities/product.entity';
import { slugify } from '../../../common/helpers/string.helper';

class ProductFactory {
  /**
   * Genera datos para un producto con opciones por defecto o personalizadas
   * @param overrideOptions Opciones que sobreescriben los valores por defecto
   * @returns Objeto con datos del producto
   */
  generate(overrideOptions: Partial<Product> = {}): Product {
    const name = overrideOptions.name || faker.commerce.productName();

    const product = new Product();
    product.name = name;
    product.slug = overrideOptions.slug || slugify(name);
    product.description =
      overrideOptions.description || faker.commerce.productDescription();
    product.price =
      overrideOptions.price ||
      parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
    product.discountPrice =
      overrideOptions.discountPrice ||
      (Math.random() > 0.7
        ? parseFloat(
            faker.commerce.price({ min: 5, max: product.price as number }),
          )
        : null);
    product.stock =
      overrideOptions.stock || faker.number.int({ min: 0, max: 100 });
    product.image = overrideOptions.image || faker.image.url();
    product.categories = overrideOptions.categories || [];
    product.variants = overrideOptions.variants || [];
    product.images = overrideOptions.images || [];

    return product;
  }

  /**
   * Genera múltiples productos
   * @param count Número de productos a generar
   * @returns Array de productos generados
   */
  generateMany(count: number): Product[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

export const productFactory = new ProductFactory();
