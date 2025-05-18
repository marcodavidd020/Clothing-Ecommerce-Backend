import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ModelRepository } from '../../common/repositories/model.repository';
import { ProductSerializer } from '../serializers/product.serializer';
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

  async findAll(relations: string[] = []): Promise<Product[]> {
    return this.repository.find({
      where: { isActive: true },
      relations,
    });
  }

  async paginate(
    options: IPaginationOptions,
    relationsToLoad: string[] = [],
  ): Promise<IPaginatedResult<ProductSerializer>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('product');
    queryBuilder.where('product.isActive = :isActive', { isActive: true });

    if (relationsToLoad.includes('categories')) {
      queryBuilder.leftJoinAndSelect('product.categories', 'categories');
    }

    if (relationsToLoad.includes('variants')) {
      queryBuilder.leftJoinAndSelect('product.variants', 'variants');
    }

    if (relationsToLoad.includes('images')) {
      queryBuilder.leftJoinAndSelect('product.images', 'images');
    }

    queryBuilder.skip(skip).take(limit);

    const [entities, totalItems] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: this.transformMany(entities),
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
  ): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations,
    });
  }

  async findBySlug(
    slug: string,
    relations: string[] = [],
  ): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { slug, isActive: true },
      relations,
    });
    return entity;
  }

  async findRawBySlug(
    slug: string,
    relations: string[] = [],
  ): Promise<Product | null> {
    return this.repository.findOne({
      where: { slug },
      relations,
    });
  }

  async findEntityById(id: string, relations: string[] = []): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, isActive: true }, // O solo { id } si se necesita incluso inactivos
      relations,
    });
  }

  async create(data: CreateProductDto): Promise<Product> {
    const productDataWithoutRelations = {
      name: data.name,
      image: data.image,
      slug: data.slug,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock || 0,
      isActive: true,
    };

    const newProduct = this.repository.create(productDataWithoutRelations);

    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await this.categoryRepository.find({
        where: { id: In(data.categoryIds) },
      });
      newProduct.categories = categories;
    } else {
      newProduct.categories = [];
    }

    return this.repository.save(newProduct);
  }

  async update(
    id: string,
    data: UpdateProductDto,
  ): Promise<Product | null> {
    const product = await this.repository.findOne({
      where: { id, isActive: true },
      relations: ['categories'],
    });
    if (!product) return null;

    const merged = this.repository.merge(product, data);

    if (data.categoryIds !== undefined) {
      if (data.replaceCategories) {
        if (data.categoryIds.length > 0) {
          const categories = await this.categoryRepository.find({
            where: { id: In(data.categoryIds) },
          });
          merged.categories = categories;
        } else {
          merged.categories = [];
        }
      } else if (data.categoryIds.length > 0) {
        const newCategories = await this.categoryRepository.find({
          where: { id: In(data.categoryIds) },
        });
        const existingCategoryIds = merged.categories.map((cat) => cat.id);
        const uniqueNewCategories = newCategories.filter(
          (cat) => !existingCategoryIds.includes(cat.id),
        );
        merged.categories = [...merged.categories, ...uniqueNewCategories];
      }
    } else if (data.replaceCategories) {
      merged.categories = [];
    }

    return this.repository.save(merged);
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteEntity(id);
  }

  async deactivateProduct(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected ? result.affected > 0 : false;
  }

  async save(entity: Product): Promise<Product> {
    return this.repository.save(entity);
  }
}
