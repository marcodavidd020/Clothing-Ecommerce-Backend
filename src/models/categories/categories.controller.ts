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
  NotFoundException,
  ConflictException,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CategorySerializer } from './serializers/category.serializer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SetParentCategoryDto } from './dto/set-parent-category.dto';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { createPaginatedResponse } from '../../common/helpers/responses/pagination.helper';
import {
  createNotFoundResponse,
  createErrorResponse,
} from '../../common/helpers/responses/error.helper';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import {
  serializeModel,
  serializeModels,
} from '../../models/common/serializers/model.serializer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { CategoryPermissionsEnum } from './constants/categorie-permissions';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  paginatedResponseSchema,
  paginationQueryParams,
} from 'src/common/schemas/pagination.schema';

@ApiTags('Categorías')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'Obtener todas las categorías',
    description:
      'Retorna un listado de todas las categorías registradas. Los resultados pueden ser paginados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de categorías (con o sin paginación)',
    schema: paginatedResponseSchema('#/components/schemas/CategorySerializer'),
  })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @RequirePermissions(CategoryPermissionsEnum.VIEW)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<CategorySerializer[]>> {
    if (paginationDto.page || paginationDto.limit) {
      const paginatedResult =
        await this.categoriesService.findPaginated(paginationDto);
      return createPaginatedResponse(
        paginatedResult,
        'Categorías recuperadas exitosamente',
      );
    }
    const categories = await this.categoriesService.findAll();
    const serializedCategories = serializeModels(
      categories,
      CategorySerializer,
    );
    return createSuccessResponse(
      serializedCategories,
      'Categorías recuperadas exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Obtener árbol de categorías',
    description:
      'Retorna las categorías en una estructura de árbol, indicando cuáles tienen subcategorías con el atributo hasChildren e incluyendo los productos asociados a cada categoría. Este endpoint no soporta paginación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Árbol de categorías con indicador hasChildren y productos',
    type: CategorySerializer,
    isArray: true,
  })
  @RequirePermissions(CategoryPermissionsEnum.VIEW)
  @Get('tree')
  async findTree(): Promise<ISuccessResponse<CategorySerializer[]>> {
    const categoriesTree = await this.categoriesService.findTrees();
    return createSuccessResponse(
      categoriesTree,
      'Árbol de categorías recuperado exitosamente',
    );
  }

  @ApiOperation({
    summary: 'Obtener categoría por ID',
    description: 'Retorna los detalles de una categoría específica por su ID, incluyendo sus productos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la categoría',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la categoría encontrada y sus productos',
    type: CategorySerializer,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @RequirePermissions(CategoryPermissionsEnum.VIEW)
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<CategorySerializer>> {
    try {
      const category = await this.categoriesService.findById(id);
      const serializedCategory = serializeModel(category, CategorySerializer);
      return createSuccessResponse(serializedCategory, 'Categoría encontrada');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(createNotFoundResponse('Categoría'));
    }
  }

  @ApiOperation({
    summary: 'Obtener categoría por slug',
    description:
      'Retorna los detalles de una categoría específica por su slug, incluyendo sus productos asociados.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único de la categoría',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la categoría encontrada y sus productos',
    type: CategorySerializer,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @RequirePermissions(CategoryPermissionsEnum.VIEW)
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<ISuccessResponse<CategorySerializer>> {
    const category = await this.categoriesService.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(createNotFoundResponse('Categoría'));
    }
    const serializedCategory = serializeModel(category, CategorySerializer);
    return createSuccessResponse(serializedCategory, 'Categoría encontrada');
  }

  @ApiOperation({
    summary: 'Crear nueva categoría',
    description: 'Permite crear una nueva categoría.',
  })
  @ApiBody({
    description: 'Datos para crear la categoría',
    type: CreateCategoryDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: CategorySerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El slug ya está en uso' })
  @RequirePermissions(CategoryPermissionsEnum.CREATE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() categoryData: CreateCategoryDto,
  ): Promise<ISuccessResponse<CategorySerializer>> {
    try {
      const category = await this.categoriesService.create(categoryData);
      const serializedCategory = serializeModel(category, CategorySerializer);
      return createCreatedResponse(serializedCategory, 'Categoría');
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ConflictException(
        createErrorResponse(
          'Error al crear la categoría. Por favor, inténtelo de nuevo.',
        ),
      );
    }
  }

  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Actualiza los datos de una categoría existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la categoría a actualizar',
    type: String,
  })
  @ApiBody({
    description: 'Datos a actualizar de la categoría',
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada correctamente',
    type: CategorySerializer,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'El slug ya está en uso' })
  @RequirePermissions(CategoryPermissionsEnum.UPDATE)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() categoryData: UpdateCategoryDto,
  ): Promise<ISuccessResponse<CategorySerializer>> {
    try {
      const category = await this.categoriesService.update(id, categoryData);
      if (!category) {
        throw new NotFoundException(createNotFoundResponse('Categoría'));
      }
      const serializedCategory = serializeModel(category, CategorySerializer);
      return createSuccessResponse(
        serializedCategory,
        'Categoría actualizada correctamente',
      );
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ConflictException(
        createErrorResponse(
          'Error al actualizar la categoría. Por favor, inténtelo de nuevo.',
        ),
      );
    }
  }

  @ApiOperation({
    summary: 'Establecer/Cambiar el padre de una categoría',
    description:
      'Permite asignar una categoría como hija de otra, o moverla a la raíz del árbol de categorías.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría a modificar',
    type: String,
  })
  @ApiBody({
    description:
      'ID de la nueva categoría padre. Enviar parentId: null o un cuerpo vacío {} para mover a la raíz.',
    type: SetParentCategoryDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Padre de la categoría actualizado. Devuelve el árbol completo desde la raíz de la categoría modificada.',
    type: CategorySerializer,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría a modificar o categoría padre no encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede asignar una categoría como su propio padre o como padre de uno de sus descendientes (ciclo).',
  })
  @RequirePermissions(CategoryPermissionsEnum.UPDATE)
  @Patch(':id/parent')
  async setParent(
    @Param('id') id: string,
    @Body() setParentDto: SetParentCategoryDto,
  ): Promise<ISuccessResponse<CategorySerializer>> {
    const categoryTree = await this.categoriesService.setParent(
      id,
      setParentDto.parentId,
    );

    return createSuccessResponse(
      categoryTree,
      'Padre de la categoría actualizado. Árbol de la categoría afectada recuperado.',
    );
  }

  @ApiOperation({
    summary: 'Eliminar categoría',
    description: 'Elimina permanentemente una categoría del sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la categoría a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Categoría eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @RequirePermissions(CategoryPermissionsEnum.DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.categoriesService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}
