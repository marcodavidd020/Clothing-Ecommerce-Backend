import {
  DeepPartial,
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
  EntityMetadata,
  ObjectLiteral,
  FindManyOptions,
} from 'typeorm';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ModelSerializer } from '../serializers/model.serializer';
import {
  IPaginationOptions,
  IPaginatedResult,
} from '../../../common/interfaces/pagination.interface';

export class ModelRepository<
  T extends ObjectLiteral,
  S extends ModelSerializer,
> {
  protected manager: EntityManager;
  protected repository: Repository<T>;
  protected metadata: EntityMetadata;
  protected readonly serializerClass: ClassConstructor<S>;

  constructor(serializerClass: ClassConstructor<S>) {
    this.serializerClass = serializerClass;
  }

  /**
   * Obtener todos los registros
   */
  protected async getAll(relations: string[] = []): Promise<S[]> {
    const entities = await this.repository.find({
      relations: relations as unknown as FindOptionsRelations<T>,
    });
    return this.transformMany(entities);
  }

  /**
   * Obtener un registro por ID
   */
  protected async get(id: string, relations: string[] = []): Promise<S | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: relations as unknown as FindOptionsRelations<T>,
    });
    return entity ? this.transform(entity) : null;
  }

  /**
   * Obtener una entidad cruda (sin serializar) por ID
   */
  async findRawById(id: string, relations: string[] = []): Promise<T | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations: relations as unknown as FindOptionsRelations<T>,
    });
    return entity;
  }

  /**
   * Obtener un registro por un criterio
   */
  protected async getBy(
    where: FindOptionsWhere<T>,
    relations: string[] = [],
    throwOnNotFound: boolean = true,
  ): Promise<S | null> {
    const entity = await this.repository.findOne({
      where,
      relations: relations as unknown as FindOptionsRelations<T>,
    });

    if (!entity && throwOnNotFound) {
      throw new Error(
        `Entity not found for criteria: ${JSON.stringify(where)}`,
      );
    }

    return entity ? this.transform(entity) : null;
  }

  /**
   * Crear una entidad
   */
  protected async createEntity(
    data: DeepPartial<T>,
    relations: string[] = [],
  ): Promise<S> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);

    if (relations.length > 0) {
      return this.get((saved as any).id, relations) as Promise<S>;
    }

    return this.transform(saved);
  }

  /**
   * Actualizar una entidad
   */
  protected async updateEntity(
    id: string,
    data: DeepPartial<T>,
    relations: string[] = [],
  ): Promise<S | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!entity) {
      return null;
    }

    const merged = this.repository.merge(entity, data);
    await this.repository.save(merged);

    if (relations.length > 0) {
      return this.get(id, relations);
    }

    return this.transform(merged);
  }

  /**
   * Eliminar una entidad
   */
  protected async deleteEntity(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Transformar una entidad a su serializer
   */
  protected transform(entity: T): S {
    return plainToInstance(this.serializerClass, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Transformar un array de entidades a sus serializers
   */
  protected transformMany(entities: T[]): S[] {
    return plainToInstance(this.serializerClass, entities, {
      excludeExtraneousValues: true,
    });
  }

  async paginate(
    options: IPaginationOptions = {},
    relations: string[] = [],
    where?: FindOptionsWhere<T>,
  ): Promise<IPaginatedResult<S>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const skip = (page - 1) * limit;

    const findOptions: FindManyOptions<T> = {
      relations: relations as unknown as FindOptionsRelations<T>,
      skip,
      take: limit,
    };

    if (where) {
      findOptions.where = where;
    }

    const [entities, totalItems] =
      await this.repository.findAndCount(findOptions);

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

  async getAllBy(
    where: FindOptionsWhere<T>,
    relations: string[] = [],
  ): Promise<S[]> {
    return await this.repository
      .find({ where, relations })
      .then((entities) => this.transformMany(entities))
      .catch((error) => Promise.reject(error));
  }

  async paginateBy(
    where: FindOptionsWhere<T>,
    options: IPaginationOptions = {},
    relations: string[] = [],
  ): Promise<IPaginatedResult<S>> {
    return this.paginate(options, relations, where);
  }
}
