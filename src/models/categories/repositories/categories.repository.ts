import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  DataSource,
  Repository,
  TreeRepository,
  DeleteResult,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { CategorySerializer } from '../serializers/category.serializer';
import {
  ICategoryCreate,
  ICategoryUpdate,
} from '../interfaces/category.interface';
import {
  IPaginatedResult,
  IPaginationOptions,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class CategoriesRepository extends ModelRepository<
  Category,
  CategorySerializer
> {
  private categoryRepository: TreeRepository<Category>;
  private readonly logger = new Logger(CategoriesRepository.name);

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(CategorySerializer);
    this.manager = dataSource.manager;
    this.metadata = dataSource.getRepository(Category).metadata;
    this.categoryRepository = dataSource.getTreeRepository(Category);
  }

  /**
   * Obtener todas las categorías (como lista plana)
   */
  async findAll(): Promise<CategorySerializer[]> {
    const categories = await this.categoryRepository.find();
    return this.transformMany(categories);
  }

  /**
   * Obtener todas las categorías como árbol
   */
  async findTrees(): Promise<CategorySerializer[]> {
    const trees = await this.categoryRepository.findTrees();
    return this.transformMany(trees);
  }

  /**
   * Obtener categorías paginadas
   */
  async paginate(
    options: IPaginationOptions,
    relations: string[] = [],
  ): Promise<IPaginatedResult<CategorySerializer>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const queryBuilder: SelectQueryBuilder<Category> =
      this.categoryRepository.createQueryBuilder('category');

    // Añadir relaciones si se especifican
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`category.${relation}`, relation);
    });

    const [entities, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  /**
   * Obtener una categoría por id (con hijos)
   */
  async findById(id: string): Promise<CategorySerializer | null> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'], // Incluir hijos directos
    });
    if (!category) {
      return null;
    }
    return this.transform(category);
  }

  /**
   * Obtener una categoría por slug
   */
  async findBySlug(slug: string): Promise<CategorySerializer | null> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children'], // Incluir hijos directos
    });
    if (!category) {
      return null;
    }
    return this.transform(category);
  }

  /**
   * Crear una nueva categoría
   */
  async create(categoryData: ICategoryCreate): Promise<CategorySerializer> {
    const { parentId, ...data } = categoryData;
    const category = this.categoryRepository.create(data);

    if (parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (parentCategory) {
        category.parent = parentCategory;
      } else {
        throw new NotFoundException(
          `Parent category with ID ${parentId} not found`,
        );
      }
    }

    const savedCategory = await this.categoryRepository.save(category);
    return this.transform(savedCategory);
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    categoryData: ICategoryUpdate,
  ): Promise<CategorySerializer | null> {
    const { parentId, ...data } = categoryData;
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      return null;
    }

    // Actualizar name y slug si están presentes en data
    if (data.name !== undefined) category.name = data.name;
    if (data.slug !== undefined) category.slug = data.slug;

    // Manejar cambio de padre por separado
    if (parentId !== undefined) {
      // Permite null para eliminar padre
      if (parentId === null) {
        category.parent = null;
      } else {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: parentId },
        });
        if (parentCategory) {
          category.parent = parentCategory;
        } else {
          throw new NotFoundException(
            `Parent category with ID ${parentId} not found`,
          );
        }
      }
    }

    // Guardar la categoría actualizada (esto también maneja los cambios de padre en closure table)
    const savedCategory = await this.categoryRepository.save(category);

    return this.transform(savedCategory);
  }

  /**
   * Eliminar una categoría
   * Nota: La eliminación de nodos en árboles de closure table con TreeRepository.delete debería
   * eliminar el nodo y todas las entradas de la tabla de closure relacionadas.
   */
  async delete(id: string): Promise<boolean> {
    const result: DeleteResult = await this.categoryRepository.delete(id);
    // Verificar `affected` ya que puede ser null/undefined dependiendo del driver/resultado
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  /**
   * Obtener una categoría por id sin transformar y sin relaciones (raw)
   */
  async getRawById(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  /**
   * Obtener una categoría por id sin transformar, pero con relaciones específicas.
   */
  async getRawByIdWithRelations(
    id: string,
    relations: string[],
  ): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id }, relations });
  }

  /**
   * Actualizar la relación padre de una categoría
   */
  async updateParentRelationship(
    category: Category,
    parent: Category | null,
  ): Promise<Category> {
    category.parent = parent;
    return this.categoryRepository.save(category);
  }

  /**
   * Encuentra el ancestro raíz de una categoría dada.
   */
  async findRootAncestor(category: Category): Promise<Category> {
    const ancestors = await this.categoryRepository.findAncestors(category);
    // findAncestors(entity) devuelve [entity, parent, grandparent, ...], la raíz es la última.
    // Si la entidad es una raíz, devuelve [entity].
    if (ancestors.length > 0) {
      return ancestors[ancestors.length - 1];
    }
    this.logger.warn(
      `No ancestors found for category ID ${category.id}, returning category itself as root.`,
    );
    return category;
  }

  /**
   * Encuentra el árbol de descendientes para una categoría dada.
   * Este es un wrapper alrededor del método de TreeRepository.
   */
  async findDescendantsTree(category: Category): Promise<Category | undefined> {
    return this.categoryRepository.findDescendantsTree(category);
  }
}
