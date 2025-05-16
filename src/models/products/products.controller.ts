import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
    paginatedResponseSchema,
    paginationQueryParams,
} from 'src/common/schemas/pagination.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { ProductPermissionsEnum } from './constants/product-permissions.constant';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { ProductSerializer } from './serializers/product.serializer';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery(paginationQueryParams[0]) // page
  @ApiQuery(paginationQueryParams[1]) // limit
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (1 por defecto)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página (10 por defecto)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos',
    schema: paginatedResponseSchema('#/components/schemas/ProductSerializer'),
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<ProductSerializer[] | IPaginatedResult<ProductSerializer>> {
    if (paginationDto.page || paginationDto.limit) {
      return this.productsService.findPaginated({
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
      });
    }

    return this.productsService.findAll();
  }

  @Get(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: ProductSerializer,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductSerializer> {
    return this.productsService.findById(id);
  }

  @Get('slug/:slug')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener un producto por slug' })
  @ApiParam({ name: 'slug', description: 'Slug del producto', type: String })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: ProductSerializer,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findBySlug(@Param('slug') slug: string): Promise<ProductSerializer> {
    const product = await this.productsService.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }
    return product;
  }

  @Post()
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: ProductSerializer,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductSerializer> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: ProductSerializer,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductSerializer> {
    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );
    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return updatedProduct;
  }

  @Delete(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto', type: String })
  @ApiResponse({ status: 204, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.delete(id);
  }
}
