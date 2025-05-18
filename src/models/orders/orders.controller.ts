import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
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
import { OrdersService } from './orders.service';
import { OrderSerializer } from './serializers/order.serializer';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/metadata/permissions.metadata';
import { OrderPermissionsEnum } from './constants/order-permissions';
import { LoggedInUser } from '../../common/decorators/requests/logged-in-user.decorator';
import { IJwtUser } from '../../authentication/interfaces/jwt-user.interface';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { createPaginatedResponse } from '../../common/helpers/responses/pagination.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  paginatedResponseSchema,
  paginationQueryParams,
} from '../../common/schemas/pagination.schema';
import { OrderStatusEnum } from './constants/order.enums';

@ApiTags('Órdenes')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({
    summary: 'Realizar una nueva orden (Place order)',
    description: 'Crea una nueva orden para el usuario autenticado.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente.',
    type: OrderSerializer,
  })
  @RequirePermissions(OrderPermissionsEnum.CREATE_OWN)
  @Post()
  async placeOrder(
    @LoggedInUser() user: IJwtUser,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    const order = await this.ordersService.placeOrder(createOrderDto, user.id);
    return createCreatedResponse(order, 'Orden');
  }

  @ApiOperation({ summary: 'Obtener mis órdenes (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de mis órdenes paginadas',
    schema: paginatedResponseSchema('#/components/schemas/OrderSerializer'),
  })
  @RequirePermissions(OrderPermissionsEnum.VIEW_OWN)
  @Get('my-orders')
  async getMyOrders(
    @LoggedInUser() user: IJwtUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<OrderSerializer[]>> {
    const paginatedResult = await this.ordersService.findOrdersByUser(
      user.id,
      paginationDto,
    );
    return createPaginatedResponse(
      paginatedResult,
      'Mis órdenes recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener una orden específica por ID (propia)' })
  @ApiParam({ name: 'id', description: 'ID de la Orden', type: String })
  @ApiResponse({ status: 200, type: OrderSerializer })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @RequirePermissions(OrderPermissionsEnum.VIEW_OWN)
  @Get('my-orders/:id')
  async getMyOrderById(
    @LoggedInUser() user: IJwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    const order = await this.ordersService.findOrderById(id, user.id);
    return createSuccessResponse(order, 'Orden recuperada exitosamente');
  }

  @ApiOperation({ summary: 'Cancelar una orden (propia)' })
  @ApiParam({
    name: 'id',
    description: 'ID de la Orden a cancelar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada',
    type: OrderSerializer,
  })
  @RequirePermissions(OrderPermissionsEnum.CANCEL_OWN)
  @Patch(':id/cancel-my-order') // Ruta específica para usuario final
  async cancelMyOrder(
    @LoggedInUser() user: IJwtUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    const order = await this.ordersService.cancelOrder(id, user.id);
    return createSuccessResponse(order, 'Orden cancelada exitosamente');
  }

  // --- Rutas de Administrador ---
  @ApiOperation({ summary: '(Admin) Obtener todas las órdenes (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las órdenes paginadas',
    schema: paginatedResponseSchema('#/components/schemas/OrderSerializer'),
  })
  @RequirePermissions(OrderPermissionsEnum.VIEW_ANY)
  @Get()
  async getAllOrders(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<OrderSerializer[]>> {
    const paginatedResult =
      await this.ordersService.findAllOrders(paginationDto);
    return createPaginatedResponse(
      paginatedResult,
      'Órdenes recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: '(Admin) Obtener una orden por ID' })
  @ApiParam({ name: 'id', description: 'ID de la Orden', type: String })
  @ApiResponse({ status: 200, type: OrderSerializer })
  @RequirePermissions(OrderPermissionsEnum.VIEW_ANY)
  @Get(':id')
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    const order = await this.ordersService.findOrderById(id);
    return createSuccessResponse(order, 'Orden recuperada exitosamente');
  }

  @ApiOperation({ summary: '(Admin) Actualizar estado de una orden' })
  @ApiParam({ name: 'id', description: 'ID de la Orden', type: String })
  @ApiBody({
    description: 'Nuevo estado y opcionalmente ID de transacción de pago',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(OrderStatusEnum) },
        paymentTransactionId: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 200, type: OrderSerializer })
  @RequirePermissions(OrderPermissionsEnum.UPDATE_ANY_STATUS)
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatusEnum,
    @Body('paymentTransactionId') paymentTransactionId?: string,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    const order = await this.ordersService.updateOrderStatus(
      id,
      status,
      paymentTransactionId,
    );
    return createSuccessResponse(order, 'Estado de la orden actualizado');
  }

  @ApiOperation({
    summary: '(Admin) Actualizar datos generales de una orden (uso limitado)',
  })
  @ApiParam({ name: 'id', description: 'ID de la Orden a actualizar' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada',
    type: OrderSerializer,
  })
  @RequirePermissions(OrderPermissionsEnum.MANAGE_ANY) // Permiso más genérico para admin
  @Put(':id')
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ISuccessResponse<OrderSerializer>> {
    // Este servicio es conceptual, el servicio actual de OrdersService no tiene un método `update` genérico.
    // Se necesitaría un método en el servicio que maneje la actualización general de campos permitidos.
    // Por ahora, esto es un placeholder.
    // const order = await this.ordersService.update(id, updateOrderDto);
    // return createSuccessResponse(order, 'Orden actualizada exitosamente');
    throw new Error(
      'Método de actualización general de orden no implementado completamente en servicio.',
    );
  }
}
