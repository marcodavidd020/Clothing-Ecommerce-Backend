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
} from '@nestjs/swagger';
import { ProductImagesService } from './product-images.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProductImageSerializer } from './serializers/product-image.serializer';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { ProductPermissionsEnum } from './constants/product-permissions.constant';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@Controller('product-images')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProductImagesController {
  constructor(private readonly imagesService: ProductImagesService) {}

  @Get('product/:productId')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener imágenes por ID de producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de imágenes',
    type: ProductImageSerializer,
  })
  async findByProductId(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductImageSerializer[]> {
    return this.imagesService.findByProductId(productId);
  }

  @Get(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Obtener una imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: String })
  @ApiResponse({
    status: 200,
    description: 'Imagen encontrada',
    type: ProductImageSerializer,
  })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductImageSerializer> {
    return this.imagesService.findById(id);
  }

  // Note: Creating images is typically done via the product endpoint
  // This endpoint is provided for potential independent creation if needed, but requires productId in body.
  @Post()
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_IMAGE_CREATE)
  @ApiOperation({ summary: 'Crear una nueva imagen de producto' })
  @ApiBody({ type: CreateProductImageDto })
  @ApiResponse({
    status: 201,
    description: 'Imagen creada exitosamente',
    type: ProductImageSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async create(
    @Body() createImageDto: CreateProductImageDto & { productId: string },
  ): Promise<ProductImageSerializer> {
    return this.imagesService.create(createImageDto);
  }

  @Put(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_IMAGE_UPDATE)
  @ApiOperation({ summary: 'Actualizar una imagen de producto existente' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: String })
  @ApiBody({ type: UpdateProductImageDto })
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada exitosamente',
    type: ProductImageSerializer,
  })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateProductImageDto,
  ): Promise<ProductImageSerializer> {
    return this.imagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @RequirePermissions(ProductPermissionsEnum.PRODUCT_IMAGE_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una imagen de producto' })
  @ApiParam({ name: 'id', description: 'ID de la imagen', type: String })
  @ApiResponse({ status: 204, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Imagen no encontrada' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.imagesService.delete(id);
  }
}
