import { faker } from '@faker-js/faker';
import { Category } from '../../../models/categories/entities/category.entity';
import { slugify } from '../../../common/helpers/string.helper';

export class CategoryFactory {
  // No constructor si no hay clase base que lo requiera

  public generate(baseOverrides?: Partial<Category>): Partial<Category> {
    const name = baseOverrides?.name || faker.commerce.department();
    const slug = baseOverrides?.slug || slugify(name);
    const image = baseOverrides?.image || faker.image.urlPicsumPhotos();

    return {
      name: name,
      slug: slug,
      image: image,
      // El campo 'parent' se manejará directamente en el seeder
      ...baseOverrides,
    };
  }
}

// Crear una instancia de la fábrica
export const categoryFactory = new CategoryFactory();
