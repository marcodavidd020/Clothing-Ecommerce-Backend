import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductSerializer } from '../serializers/product.serializer';
import { ModelRepository } from '../../common/repositories/model.repository';
import { plainToInstance } from 'class-transformer';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../../common/interfaces/pagination.interface';
// La paginación se maneja directamente en este repositorio, no necesitamos paginateQuery
// import { paginateQuery } from '../../../common/helpers/pagination.helper';

@Injectable()
export class ProductsRepository extends ModelRepository<
  Product,
  ProductSerializer
> {
  private readonly logger = new Logger(ProductsRepository.name);

  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Category) // Still need Category repository directly for category relation logic in create/update
    private readonly categoryRepository: Repository<Category>,
  ) {
    super(ProductSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Product);
  }

  async findAll(relations: string[] = []): Promise<ProductSerializer[]> {
    return this.getAll(relations);
  }

  async paginate(
    options: IPaginationOptions,
    relations: string[] = [],
  ): Promise<IPaginatedResult<ProductSerializer>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('product');

    if (relations.includes('categories')) {
      queryBuilder.leftJoinAndSelect('product.categories', 'categories');
    }

    if (relations.includes('variants')) {
      queryBuilder.leftJoinAndSelect('product.variants', 'variants');
    }

    if (relations.includes('images')) {
      queryBuilder.leftJoinAndSelect('product.images', 'images');
    }

    queryBuilder.skip(skip).take(limit);

    const [entities, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    // Convertir los items de Product a ProductSerializer usando transformMany
    return {
      data: this.transformMany(entities), // Use transformMany
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(
    id: string,
    relations: string[] = [],
  ): Promise<ProductSerializer | null> {
    return this.get(id, relations);
  }

  async findBySlug(
    slug: string,
    relations: string[] = [],
  ): Promise<ProductSerializer | null> {
    // Use getBy with throwOnNotFound set to false to match original logic
    return this.getBy({ slug } as any, relations, false);
  }

  async create(data: CreateProductDto): Promise<ProductSerializer> {
    // Crear el producto base - Use createEntity but need to handle categories separately
    const productDataWithoutRelations = {
      name: data.name,
      image: data.image,
      slug: data.slug,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock || 0,
    };

    const newProduct = this.repository.create(productDataWithoutRelations);

    // Si se proporcionaron IDs de categorías, las agregamos al producto
    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(data.categoryIds) },
      });
      newProduct.categories = categories;
    } else {
      newProduct.categories = [];
    }

    // Guardar el producto en la base de datos
    const savedProduct = await this.repository.save(newProduct);

    // Retornamos el producto serializado - Use transform
    return this.transform(savedProduct);
  }

  async update(
    id: string,
    data: UpdateProductDto,
  ): Promise<ProductSerializer | null> {
    // Obtener el producto existente con relaciones si es necesario para la lógica de categorías
    const product = await this.repository.findOne({
      where: { id },
      relations: ['categories'], // Need existing categories to handle replacement/addition
    });
    if (!product) return null;

    // Actualizar los campos directos - Use merge from repository, not updateEntity directly
    // This is because updateEntity expects DeepPartial<T> and saves directly,
    // but we need to modify the fetched entity before saving due to custom category logic.
    const merged = this.repository.merge(product, data);

    // Manejar categorías si se proporcionaron
    if (data.categoryIds !== undefined) {
      // Check specifically for undefined to allow null/empty array
      if (data.replaceCategories) {
        // Reemplazar las categorías existentes
        if (data.categoryIds.length > 0) {
          const categories = await this.categoryRepository.find({
            where: { id: In(data.categoryIds) },
          });
          merged.categories = categories;
        } else {
          merged.categories = [];
        }
      } else if (data.categoryIds.length > 0) {
        // Agregar nuevas categorías manteniendo las existentes
        const newCategories = await this.categoryRepository.find({
          where: { id: In(data.categoryIds) },
        });
        // Filtrar para evitar duplicados
        const existingCategoryIds = merged.categories.map((cat) => cat.id);
        const uniqueNewCategories = newCategories.filter(
          (cat) => !existingCategoryIds.includes(cat.id),
        );
        merged.categories = [...merged.categories, ...uniqueNewCategories];
      }
    } else if (data.replaceCategories) {
      // If categoryIds is undefined but replaceCategories is true, just clear categories
      merged.categories = [];
    }

    // Guardar el producto actualizado
    const updatedProduct = await this.repository.save(merged);

    // Retornamos el producto serializado - Use transform
    return this.transform(updatedProduct);
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }
}
