import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserSerializer } from './serializers/user.serializer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { createPaginatedResponse } from '../../common/helpers/responses/pagination.helper';
import {
  createNotFoundResponse,
  createErrorResponse,
} from '../../common/helpers/responses/error.helper';
import { slugify, capitalize } from '../../common/helpers/string.helper';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import {
  paginatedResponseSchema,
  paginationQueryParams,
  searchQueryParam,
} from '../../common/schemas/pagination.schema';
import {
  serializeModel,
  serializeModels,
} from '../../models/common/serializers/model.serializer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { UserPermissionsEnum } from 'src/common/constants/permissions.enum';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Obtener todos los usuarios',
    description:
      'Retorna un listado de usuarios registrados en el sistema. Los resultados pueden ser paginados utilizando los parámetros "page" y "limit". Solo administradores pueden acceder a esta información.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de usuarios (con o sin paginación). Incluye información básica de cada usuario como nombre, email, estado, etc.',
    schema: paginatedResponseSchema('#/components/schemas/UserSerializer'),
  })
  @ApiQuery(paginationQueryParams[0]) // page
  @ApiQuery(paginationQueryParams[1]) // limit
  @RequirePermissions(UserPermissionsEnum.VIEW)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<UserSerializer[]>> {
    // Si se proporcionan parámetros de paginación, devolvemos resultados paginados
    if (paginationDto.page || paginationDto.limit) {
      const paginatedResult =
        await this.usersService.findPaginated(paginationDto);
      return createPaginatedResponse(
        paginatedResult,
        'Usuarios recuperados exitosamente',
      );
    }

    // Si no se especifican parámetros de paginación, devolvemos todos los usuarios
    const users = await this.usersService.findAll();
    const serializedUsers = serializeModels(users, UserSerializer);
    return createSuccessResponse(
      serializedUsers,
      'Usuarios recuperados exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Buscar usuarios',
    description:
      'Permite buscar usuarios usando un término de búsqueda. La búsqueda se realiza por nombre, apellido y email. Los resultados pueden ser paginados.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Resultados de búsqueda paginados con los usuarios que coinciden con el criterio.',
    schema: paginatedResponseSchema('#/components/schemas/UserSerializer'),
  })
  @ApiQuery(searchQueryParam)
  @ApiQuery(paginationQueryParams[0]) // page
  @ApiQuery(paginationQueryParams[1]) // limit
  @RequirePermissions(UserPermissionsEnum.VIEW)
  @Get('search')
  async search(
    @Query() searchDto: SearchDto,
  ): Promise<ISuccessResponse<UserSerializer[]>> {
    const searchResults = await this.usersService.search(searchDto);
    return createPaginatedResponse(
      searchResults,
      'Resultados de búsqueda recuperados exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description:
      'Retorna los detalles de un usuario específico identificado por su ID único en el sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario que se desea consultar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles completos del usuario encontrado',
    type: UserSerializer,
  })
  @ApiResponse({
    status: 404,
    description:
      'Usuario no encontrado. El ID proporcionado no corresponde a ningún usuario registrado.',
  })
  @RequirePermissions(UserPermissionsEnum.VIEW)
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<UserSerializer>> {
    try {
      const user = await this.usersService.findById(id);
      const serializedUser = serializeModel(user, UserSerializer);
      return createSuccessResponse(
        serializedUser,
        `Usuario ${capitalize(user.firstName)} encontrado`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(createNotFoundResponse('Usuario'));
    }
  }

  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description:
      'Permite crear un nuevo usuario en el sistema. La contraseña será encriptada automáticamente.',
  })
  @ApiBody({
    description: 'Datos necesarios para crear un usuario',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuario creado exitosamente. Retorna los datos del usuario creado (sin la contraseña).',
    type: UserSerializer,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos. Revise los campos requeridos y sus formatos.',
  })
  @ApiResponse({
    status: 409,
    description:
      'El email ya está registrado. No se permiten emails duplicados en el sistema.',
  })
  @RequirePermissions(UserPermissionsEnum.CREATE)
  @Post()
  async create(
    @Body() userData: CreateUserDto,
  ): Promise<ISuccessResponse<UserSerializer>> {
    try {
      // Ejemplo de uso de slugify para crear un nombre de usuario a partir del email
      const username = slugify(userData.email.split('@')[0]);
      console.log(`Nombre de usuario generado: ${username}`);

      const user = await this.usersService.create(userData);
      const serializedUser = serializeModel(user, UserSerializer);
      return createCreatedResponse(serializedUser, 'Usuario');
    } catch (error) {
      // Solo propagamos la excepción si es una que ya conocemos
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Para otros errores, damos un mensaje genérico pero registramos el detalle
      throw new ConflictException(
        createErrorResponse(
          'Error al crear el usuario. Por favor, inténtelo de nuevo.',
        ),
      );
    }
  }

  @ApiOperation({
    summary: 'Actualizar usuario',
    description:
      'Actualiza los datos de un usuario existente. Si se proporciona una nueva contraseña, ésta será encriptada automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
  })
  @ApiBody({
    description: 'Datos a actualizar del usuario',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Usuario actualizado correctamente. Retorna los datos actualizados.',
    type: UserSerializer,
  })
  @ApiResponse({
    status: 404,
    description:
      'Usuario no encontrado. El ID proporcionado no corresponde a ningún usuario existente.',
  })
  @RequirePermissions(UserPermissionsEnum.UPDATE)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: UpdateUserDto,
  ): Promise<ISuccessResponse<UserSerializer>> {
    const user = await this.usersService.update(id, userData);
    if (!user) {
      throw new NotFoundException(createNotFoundResponse('Usuario'));
    }
    const serializedUser = serializeModel(user, UserSerializer);
    return createSuccessResponse(
      serializedUser,
      'Usuario actualizado correctamente',
    );
  }

  @ApiOperation({
    summary: 'Eliminar usuario',
    description:
      'Elimina permanentemente a un usuario del sistema. Esta acción no puede deshacerse.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado correctamente. No se devuelve contenido.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Usuario no encontrado. El ID proporcionado no existe en el sistema.',
  })
  @RequirePermissions(UserPermissionsEnum.DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }
}
