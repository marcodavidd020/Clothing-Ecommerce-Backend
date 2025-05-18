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
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CouponSerializer } from './serializers/coupon.serializer';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { createPaginatedResponse } from '../../common/helpers/responses/pagination.helper';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  paginatedResponseSchema,
  paginationQueryParams,
} from '../../common/schemas/pagination.schema';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { CouponPermissionsEnum } from './constants/coupon-permissions';

@ApiTags('Cupones')
@ApiBearerAuth('JWT-auth')
@Controller('coupons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @ApiOperation({ summary: 'Obtener todos los cupones (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de cupones paginados',
    schema: paginatedResponseSchema('#/components/schemas/CouponSerializer'),
  })
  @RequirePermissions(CouponPermissionsEnum.VIEW)
  @Get()
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<CouponSerializer[]>> {
    const paginatedResult =
      await this.couponsService.findAllPaginated(paginationDto);
    return createPaginatedResponse(
      paginatedResult,
      'Cupones recuperados exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener cupón por ID' })
  @ApiParam({ name: 'id', description: 'ID del Cupón', type: String })
  @ApiResponse({
    status: 200,
    description: 'Cupón encontrado',
    type: CouponSerializer,
  })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  @RequirePermissions(CouponPermissionsEnum.VIEW)
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<CouponSerializer>> {
    const coupon = await this.couponsService.findById(id);
    return createSuccessResponse(coupon, 'Cupón encontrado exitosamente');
  }

  @ApiOperation({ summary: 'Obtener cupón por código' })
  @ApiParam({ name: 'code', description: 'Código del Cupón', type: String })
  @ApiResponse({
    status: 200,
    description: 'Cupón encontrado',
    type: CouponSerializer,
  })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  @RequirePermissions(CouponPermissionsEnum.VIEW) // O APPLY si es para usuarios finales
  @Get('code/:code')
  async findByCode(
    @Param('code') code: string,
  ): Promise<ISuccessResponse<CouponSerializer>> {
    const coupon = await this.couponsService.findByCode(code);
    return createSuccessResponse(
      coupon,
      'Cupón encontrado exitosamente por código',
    );
  }

  @ApiOperation({ summary: 'Crear un nuevo cupón' })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({
    status: 201,
    description: 'Cupón creado exitosamente',
    type: CouponSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Conflicto, ej. código ya existe' })
  @RequirePermissions(CouponPermissionsEnum.CREATE)
  @Post()
  async create(
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<ISuccessResponse<CouponSerializer>> {
    const coupon = await this.couponsService.create(createCouponDto);
    return createCreatedResponse(coupon, 'Cupón');
  }

  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  @ApiParam({
    name: 'id',
    description: 'ID del Cupón a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({
    status: 200,
    description: 'Cupón actualizado',
    type: CouponSerializer,
  })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto, ej. código ya existe' })
  @RequirePermissions(CouponPermissionsEnum.UPDATE)
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<ISuccessResponse<CouponSerializer>> {
    const coupon = await this.couponsService.update(id, updateCouponDto);
    return createSuccessResponse(coupon, 'Cupón actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar un cupón (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del Cupón a eliminar',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Cupón eliminado' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  @RequirePermissions(CouponPermissionsEnum.DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.couponsService.delete(id);
  }

  @ApiOperation({ summary: 'Validar un cupón para su uso' })
  @ApiParam({ name: 'code', description: 'Código del cupón a validar' })
  @ApiBody({
    required: false,
    schema: {
      type: 'object',
      properties: {
        orderAmount: {
          type: 'number',
          description: 'Monto de la orden actual',
          example: 75.5,
        },
        userId: {
          type: 'string',
          description:
            'ID del usuario (opcional, para validaciones de uso por usuario)',
          example: 'uuid-del-usuario',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cupón es válido' })
  @ApiResponse({ status: 400, description: 'Cupón no es válido o ha expirado' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  @RequirePermissions(CouponPermissionsEnum.APPLY) // Típicamente para usuarios finales
  @Post('validate/:code')
  async validateCoupon(
    @Param('code') code: string,
    @Body('orderAmount') orderAmount?: number,
    @Body('userId') userId?: string,
  ): Promise<
    ISuccessResponse<{ isValid: boolean; couponDetails?: CouponSerializer }>
  > {
    const couponEntity = await this.couponsService.validateCouponForUse(
      code,
      orderAmount,
      userId,
    );
    // Si validateCouponForUse no lanza error, el cupón es válido
    return createSuccessResponse(
      { isValid: true, couponDetails: new CouponSerializer(couponEntity) },
      'El cupón es válido.',
    );
  }
}
