import { faker } from '@faker-js/faker';
import { ProductImage } from '../../../models/products/entities/product-image.entity';
import { Product } from '../../../models/products/entities/product.entity';

class ProductImageFactory {
  /**
   * Genera datos para una imagen de producto
   * @param product Producto al que pertenece la imagen
   * @param overrideOptions Opciones que sobreescriben los valores por defecto
   * @returns Objeto con datos de la imagen
   */
  generate(product: Product, overrideOptions: Partial<ProductImage> = {}): ProductImage {
    const image = new ProductImage();
    image.url = overrideOptions.url || faker.image.url();
    image.alt = overrideOptions.alt || `Imagen de ${product.name}`;
    image.product = product;
    image.productId = product.id;
    
    return image;
  }

  /**
   * Genera múltiples imágenes para un producto
   * @param product Producto al que pertenecen las imágenes
   * @param count Número de imágenes a generar
   * @returns Array de imágenes generadas
   */
  generateMany(product: Product, count: number): ProductImage[] {
    return Array.from({ length: count }, () => this.generate(product));
  }
}

export const productImageFactory = new ProductImageFactory(); 