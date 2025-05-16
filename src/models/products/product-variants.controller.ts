import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantSerializer } from './serializers/product-variant.serializer';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { ProductPermissionsEnum } from './constants/product-permissions.constant';
import { paginationQueryParams } from 'src/common/schemas/pagination.schema';


@ApiTags('Variantes de Productos')
@ApiBearerAuth('JWT-auth')
@Controller('product-variants')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProductVariantsController {
  constructor(private readonly variantsService: ProductVariantsService) {}

  @Get('product/:productId')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener variantes por ID de producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de variantes',
    type: ProductVariantSerializer,
  })
  async findByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariantSerializer[]> {
    return this.variantsService.findByProductId(productId);
  }

  @Get(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener una variante por ID' })
  @ApiParam({ name: 'id', description: 'ID de la variante', type: String })
  @ApiResponse({
    status: 200,
    description: 'Variante encontrada',
    type: ProductVariantSerializer,
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductVariantSerializer> {
    return this.variantsService.findById(id);
  }

  // Note: Creating variants is typically done via the product endpoint
  // This endpoint is provided for potential independent creation if needed, but requires productId in body.
  @Post()
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VARIANT_CREATE)
  @ApiOperation({ summary: 'Crear una nueva variante de producto' })
  @ApiBody({ type: CreateProductVariantDto })
  @ApiResponse({
    status: 201,
    description: 'Variante creada exitosamente',
    type: ProductVariantSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async create(
    @Body() createVariantDto: CreateProductVariantDto & { productId: string },
  ): Promise<ProductVariantSerializer> {
    return this.variantsService.create(createVariantDto);
  }

  @Put(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VARIANT_UPDATE)
  @ApiOperation({ summary: 'Actualizar una variante de producto existente' })
  @ApiParam({ name: 'id', description: 'ID de la variante', type: String })
  @ApiBody({ type: UpdateProductVariantDto })
  @ApiResponse({
    status: 200,
    description: 'Variante actualizada exitosamente',
    type: ProductVariantSerializer,
  })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariantSerializer> {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Delete(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VARIANT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una variante de producto' })
  @ApiParam({ name: 'id', description: 'ID de la variante', type: String })
  @ApiResponse({ status: 204, description: 'Variante eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Variante no encontrada' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.variantsService.delete(id);
  }
}
