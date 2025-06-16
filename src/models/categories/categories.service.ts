import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CategorySerializer } from './serializers/category.serializer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import { slugify } from 'src/common/helpers/string.helper';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../common/interfaces/pagination.interface';
import { Category } from './entities/category.entity';
import { serializeModel } from '../common/serializers/model.serializer';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Obtener todas las categorías como lista plana
   */
  async findAll(): Promise<CategorySerializer[]> {
    return this.categoriesRepository.findAll();
  }

  /**
   * Obtener categorías paginadas
   */
  async findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<CategorySerializer>> {
    const paginatedResult = await this.categoriesRepository.paginate(options, [
      'parent',
      'children',
    ]);
    return paginatedResult;
  }

  /**
   * Obtener todas las categorías como árbol jerárquico
   */
  async findTrees(): Promise<CategorySerializer[]> {
    const trees = await this.categoriesRepository.findTrees();
    // Enriquecemos el árbol con el atributo hasChildren explícito
    return this.enhanceTreeWithAttributes(trees);
  }

  /**
   * Buscar categoría por ID
   */
  async findById(id: string): Promise<CategorySerializer> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(createNotFoundResponse('Categoría'));
    }
    // Enriquecer con atributo hasChildren
    this.enhanceCategoryWithAttributes(category);
    return category;
  }

  /**
   * Buscar categoría por slug
   */
  async findBySlug(slug: string): Promise<CategorySerializer | null> {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (category) {
      // Enriquecer con hasChildren
      this.enhanceCategoryWithAttributes(category);
    }
    return category;
  }

  /**
   * Crear una nueva categoría
   */
  async create(categoryData: CreateCategoryDto): Promise<CategorySerializer> {
    const existingCategory = await this.categoriesRepository.findBySlug(
      categoryData.slug,
    );
    if (existingCategory) {
      throw new ConflictException({
        message: `Slug ${categoryData.slug} is already in use`,
        errors: [
          {
            field: 'slug',
            errors: [`El slug ${categoryData.slug} ya está en uso`],
            value: categoryData.slug,
          },
        ],
      });
    }

    if (!categoryData.slug) {
      categoryData.slug = slugify(categoryData.name);
    }

    return this.categoriesRepository.create(categoryData);
  }

  /**
   * Actualizar una categoría
   */
  async update(
    id: string,
    categoryData: UpdateCategoryDto,
  ): Promise<CategorySerializer | null> {
    if (categoryData.slug) {
      const existingCategory = await this.categoriesRepository.findBySlug(
        categoryData.slug,
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException({
          message: `Slug ${categoryData.slug} is already in use`,
          errors: [
            {
              field: 'slug',
              errors: [`El slug ${categoryData.slug} ya está en uso`],
              value: categoryData.slug,
            },
          ],
        });
      }
    }

    const updatedCategory = await this.categoriesRepository.update(
      id,
      categoryData,
    );
    if (!updatedCategory) {
      throw new NotFoundException(createNotFoundResponse('Categoría'));
    }
    return updatedCategory;
  }

  /**
   * Eliminar una categoría
   */
  async delete(id: string): Promise<void> {
    const success = await this.categoriesRepository.delete(id);
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Categoría'));
    }
  }

  async setParent(
    id: string,
    parentId: string | null | undefined,
  ): Promise<CategorySerializer> {
    this.logger.debug(
      `[setParent] Iniciando para categoría ID: ${id}, nuevo parentId: ${parentId}`,
    );

    const categoryToUpdate = await this.categoriesRepository.getRawById(id);
    if (!categoryToUpdate) {
      this.logger.error(
        `[setParent] Categoría a actualizar con ID: ${id} no encontrada.`,
      );
      throw new NotFoundException(
        createNotFoundResponse('Categoría a actualizar'),
      );
    }
    this.logger.debug(
      `[setParent] Categoría a actualizar encontrada: ${JSON.stringify(categoryToUpdate, null, 2)}`,
    );

    if (parentId === id) {
      this.logger.warn(
        `[setParent] Intento de asignar categoría ID: ${id} como su propio padre.`,
      );
      throw new BadRequestException(
        'Una categoría no puede ser su propio padre.',
      );
    }

    let newParentEntity: Category | null = null;
    if (parentId) {
      newParentEntity = await this.categoriesRepository.getRawById(parentId);
      if (!newParentEntity) {
        this.logger.error(
          `[setParent] Nueva categoría padre con ID: ${parentId} no encontrada.`,
        );
        throw new NotFoundException(createNotFoundResponse('Categoría padre'));
      }
      this.logger.debug(
        `[setParent] Nueva categoría padre encontrada: ${JSON.stringify(newParentEntity, null, 2)}`,
      );
    } else {
      this.logger.debug(
        `[setParent] No se proporcionó parentId, se moverá a la raíz.`,
      );
    }

    const updatedCategoryEntity =
      await this.categoriesRepository.updateParentRelationship(
        categoryToUpdate,
        newParentEntity,
      );
    this.logger.debug(
      `[setParent] Entidad después de updateParentRelationship: ${JSON.stringify(updatedCategoryEntity, null, 2)}`,
    );

    const rootAncestorEntity = await this.categoriesRepository.findRootAncestor(
      updatedCategoryEntity,
    );
    this.logger.debug(
      `[setParent] Entidad ancestro raíz encontrada: ${JSON.stringify(rootAncestorEntity, null, 2)}`,
    );

    const rootTreeWithDescendants =
      await this.categoriesRepository.findDescendantsTree(rootAncestorEntity);
    this.logger.debug(
      `[setParent] Árbol desde la raíz con descendientes (antes de serializar): ${JSON.stringify(rootTreeWithDescendants, null, 2)}`,
    );

    if (!rootTreeWithDescendants) {
      this.logger.error(
        `[setParent] Árbol raíz para categoría ID ${id} (raíz: ${rootAncestorEntity?.id}) no pudo ser cargado.`,
      );
      throw new NotFoundException(
        `El árbol raíz para la categoría con ID ${id} no pudo ser cargado después de actualizar el padre.`,
      );
    }

    const serializedTree = serializeModel(
      rootTreeWithDescendants,
      CategorySerializer,
    );
    this.logger.debug(
      `[setParent] Árbol serializado final: ${JSON.stringify(serializedTree, null, 2)}`,
    );

    return serializedTree;
  }

  /**
   * Ayudante para enriquecer el árbol con atributos adicionales
   */
  private enhanceTreeWithAttributes(
    categories: CategorySerializer[],
  ): CategorySerializer[] {
    return categories.map((category) => {
      // Calculamos hasChildren en base a la presencia de hijos
      const hasChildren =
        Array.isArray(category.children) && category.children.length > 0;
      category.hasChildren = hasChildren;

      // Si tiene hijos, procesamos recursivamente
      if (hasChildren) {
        category.children = this.enhanceTreeWithAttributes(category.children);
      }

      return category;
    });
  }

  /**
   * Ayudante para enriquecer una categoría individual con atributos adicionales
   */
  private enhanceCategoryWithAttributes(category: CategorySerializer): void {
    category.hasChildren =
      Array.isArray(category.children) && category.children.length > 0;
  }
}
