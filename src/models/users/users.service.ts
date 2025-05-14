import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UserSerializer } from './serializers/user.serializer';
import { IUserCreate, IUserUpdate } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { createNotFoundResponse } from 'src/common/helpers/responses/error.helper';
import {
  IPaginatedResult,
  IPaginationOptions,
} from '../../common/interfaces/pagination.interface';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserSerializer[]> {
    return this.usersRepository.findAll();
  }

  async findPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<UserSerializer>> {
    return this.usersRepository.paginate(options, ['addresses']);
  }

  async search(
    searchDto: SearchDto,
  ): Promise<IPaginatedResult<UserSerializer>> {
    const { q, ...paginationOptions } = searchDto;

    if (!q || q.trim() === '') {
      return this.findPaginated(paginationOptions);
    }

    return this.usersRepository.search(q, paginationOptions);
  }

  async findById(id: string): Promise<UserSerializer> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(createNotFoundResponse('Usuario'));
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserSerializer | null> {
    try {
      return await this.usersRepository.findByEmail(email);
    } catch (error) {
      this.logger.error(
        `Error al buscar usuario por email ${email}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async create(userData: CreateUserDto): Promise<UserSerializer> {
    // Verificar si el email ya existe
    const existingUser = await this.usersRepository.findByEmail(userData.email);
    if (existingUser) {
      // Proporcionar información detallada del error
      throw new ConflictException({
        message: `Email ${userData.email} is already in use`,
        errors: [
          {
            field: 'email',
            errors: [`El email ${userData.email} ya está en uso`],
            value: userData.email,
          },
        ],
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Inicializar el campo roles como un array vacío
    return this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roles: [], // Inicializamos el array de roles vacío
    });
  }

  async update(
    id: string,
    userData: UpdateUserDto,
  ): Promise<UserSerializer | null> {
    // Si se proporciona una nueva contraseña, encriptarla
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const updatedUser = await this.usersRepository.update(id, userData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const success = await this.usersRepository.delete(id);
    if (!success) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<UserSerializer | null> {
    try {
      // En este caso podemos usar directamente el método para buscar un usuario con contraseña
      this.logger.debug(`Validando contraseña para el email: ${email}`);

      const userEntity = await this.usersRepository.findUserWithPassword(email);

      if (!userEntity) {
        this.logger.debug(`No se encontró usuario con email: ${email}`);
        // Retornar null en lugar de lanzar una excepción para permitir que AuthService
        // maneje el error con su propio formato
        return null;
      }

      if (!userEntity.password) {
        this.logger.warn(`Usuario encontrado pero sin contraseña: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        userEntity.password,
      );

      if (!isPasswordValid) {
        this.logger.debug(`Contraseña inválida para el usuario: ${email}`);
        return null;
      }

      this.logger.debug(`Validación de contraseña exitosa para: ${email}`);
      return this.usersRepository.findByEmail(email);
    } catch (error) {
      this.logger.error(
        `Error validando contraseña para ${email}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }
}
