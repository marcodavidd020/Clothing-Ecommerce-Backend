import { faker } from '@faker-js/faker';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';
import { Product } from '../../../models/products/entities/product.entity';

class ProductVariantFactory {
  /**
   * Genera datos para una variante de producto
   * @param product Producto al que pertenece la variante
   * @param overrideOptions Opciones que sobreescriben los valores por defecto
   * @returns Objeto con datos de la variante
   */
  generate(
    product: Product,
    overrideOptions: Partial<ProductVariant> = {},
  ): ProductVariant {
    const colors = [
      'Black',
      'White',
      'Red',
      'Blue',
      'Green',
      'Yellow',
      'Gray',
      'Purple',
    ];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];

    const variant = new ProductVariant();
    variant.color = overrideOptions.color || faker.helpers.arrayElement(colors);
    variant.size = overrideOptions.size || faker.helpers.arrayElement(sizes);
    variant.stock =
      overrideOptions.stock !== undefined
        ? overrideOptions.stock
        : faker.number.int({ min: 1, max: 50 });
    variant.product = product;
    variant.productId = product.id;

    return variant;
  }

  /**
   * Genera múltiples variantes para un producto
   * @param product Producto al que pertenecen las variantes
   * @param count Número de variantes a generar
   * @returns Array de variantes generadas
   */
  generateMany(product: Product, count: number): ProductVariant[] {
    return Array.from({ length: count }, () => this.generate(product));
  }
}

export const productVariantFactory = new ProductVariantFactory();
