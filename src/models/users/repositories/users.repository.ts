import { Injectable } from '@nestjs/common';
import { DataSource, ILike, In } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { UserSerializer } from '../serializers/user.serializer';
import { IUserCreate, IUserUpdate } from '../interfaces/user.interface';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../../common/interfaces/pagination.interface';

@Injectable()
export class UsersRepository extends ModelRepository<User, UserSerializer> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(User);
    this.metadata = this.repository.metadata;
  }

  /**
   * Obtener todos los usuarios activos
   */
  async findAll(): Promise<UserSerializer[]> {
    return this.getAllBy({ isActive: true }, [
      'addresses',
      'userRoles',
      'userRoles.role',
    ]);
  }

  /**
   * Buscar usuario activo por id
   */
  async findById(id: string): Promise<UserSerializer | null> {
    return this.getBy({ id, isActive: true } as any, [
      'addresses',
      'userRoles',
      'userRoles.role',
    ], false);
  }

  /**
   * Buscar usuario activo por email
   */
  async findByEmail(email: string): Promise<UserSerializer | null> {
    return this.getBy(
      { email, isActive: true },
      ['addresses', 'userRoles', 'userRoles.role'],
      false,
    );
  }

  /**
   * Buscar usuarios activos por término de búsqueda
   */
  async search(
    query: string,
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<UserSerializer>> {
    // Para debugging
    console.log(`Buscando usuarios activos con query: "${query}"`);

    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.addresses', 'addresses')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .where('user.isActive = :isActive', { isActive: true });

    // Añadir condiciones de búsqueda anidadas con AND
    queryBuilder.andWhere(
      '(LOWER(user.firstName) LIKE LOWER(:query) OR ' +
        'LOWER(user.lastName) LIKE LOWER(:query) OR ' +
        'LOWER(user.email) LIKE LOWER(:query) OR ' +
        "(user.phoneNumber IS NOT NULL AND LOWER(user.phoneNumber) LIKE LOWER(:query)))",
      { query: `%${query}%` },
    );
    
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Aplicar paginación
    queryBuilder.skip(skip).take(limit);

    // Para debugging
    console.log('SQL generado:', queryBuilder.getSql());

    // Ejecutar la consulta
    const [entities, totalItems] = await queryBuilder.getManyAndCount();

    // Para debugging
    console.log(
      `Encontrados ${entities.length} resultados de un total de ${totalItems}`,
    );

    // Calcular totalPages
    const totalPages = Math.ceil(totalItems / limit);

    // Devolver el resultado paginado con el formato esperado
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
   * Buscar usuario con contraseña (para login)
   * TypeORM oculta el campo password por default,
   * necesitamos usar un approach diferente para obtenerlo
   */
  async findUserWithPassword(email: string): Promise<User | null> {
    try {
      // Usando findOneBy con select explícito para incluir todos los campos necesarios
      const user = await this.repository.findOne({
        where: { email, isActive: true },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'isActive',
          'avatar',
          'phoneNumber',
          'password',
          'createdAt',
          'updatedAt',
        ],
        relations: ['userRoles', 'userRoles.role'],
      });

      if (user) {
        console.log('Usuario encontrado, password presente:', !!user.password);
      }

      return user;
    } catch (error) {
      console.error(
        `Error al buscar usuario con contraseña: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async create(userData: IUserCreate): Promise<UserSerializer> {
    return this.createEntity(userData, [
      'addresses',
      'userRoles',
      'userRoles.role',
    ]);
  }

  async update(
    id: string,
    userData: IUserUpdate,
  ): Promise<UserSerializer | null> {
    return this.updateEntity(id, userData, [
      'addresses',
      'userRoles',
      'userRoles.role',
    ]);
  }

  /**
   * Desactivar un usuario (borrado lógico)
   * @param id ID del usuario a desactivar
   * @returns Verdadero si el usuario fue desactivado, falso en caso contrario
   */
  async deactivate(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    if (result.affected && result.affected > 0) {
      console.log(`Usuario con ID ${id} desactivado.`);
      return true;
    }
    console.log(`No se pudo desactivar el usuario con ID ${id} o ya estaba desactivado.`);
    return false;
  }

  /**
   * Eliminar un usuario (ahora desactiva)
   */
  async delete(id: string): Promise<boolean> {
    return this.deactivate(id);
  }
}
