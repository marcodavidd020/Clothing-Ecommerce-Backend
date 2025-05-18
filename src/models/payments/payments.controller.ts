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
  Patch,
  ParseUUIDPipe,
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
import { PaymentsService } from './payments.service';
import { PaymentSerializer } from './serializers/payment.serializer';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
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
// import { PermissionsGuard } from 'src/common/guards/permissions.guard'; // Descomentar si se usan permisos específicos
// import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata'; // Descomentar para permisos
// import { PaymentPermissionsEnum } from './constants/payment-permissions.enum'; // Crear este enum si se necesita

@ApiTags('Pagos')
@ApiBearerAuth('JWT-auth') // Asumiendo autenticación global
@Controller('payments')
@UseGuards(JwtAuthGuard) // Descomentar PermissionsGuard si se implementan permisos
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Obtener todos los pagos (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos paginados',
    schema: paginatedResponseSchema('#/components/schemas/PaymentSerializer'),
  })
  // @RequirePermissions(PaymentPermissionsEnum.VIEW_ALL) // Ejemplo de permiso
  @Get()
  async findAllPaginated(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<PaymentSerializer[]>> {
    const paginatedResult =
      await this.paymentsService.findAllPaginated(paginationDto);
    return createPaginatedResponse(
      paginatedResult,
      'Pagos recuperados exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del Pago', type: String })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado',
    type: PaymentSerializer,
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  // @RequirePermissions(PaymentPermissionsEnum.VIEW) // Ejemplo de permiso
  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.findById(id);
    return createSuccessResponse(payment, 'Pago encontrado exitosamente');
  }

  @ApiOperation({ summary: 'Iniciar un nuevo pago (Crear registro de pago)' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Pago iniciado (registro creado)',
    type: PaymentSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  // @RequirePermissions(PaymentPermissionsEnum.CREATE) // Ejemplo de permiso
  @Post()
  async initiatePayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment =
      await this.paymentsService.initiatePayment(createPaymentDto);
    return createCreatedResponse(payment, 'Pago');
  }

  @ApiOperation({ summary: 'Confirmar un pago' })
  @ApiParam({
    name: 'id',
    description: 'ID del Pago a confirmar',
    type: String,
  })
  @ApiBody({
    description: 'Datos de confirmación (ej. ID de transacción del proveedor)',
    schema: {
      type: 'object',
      properties: { transactionId: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Pago confirmado',
    type: PaymentSerializer,
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  // @RequirePermissions(PaymentPermissionsEnum.UPDATE) // Ejemplo de permiso
  @Patch(':id/confirm')
  async confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('transactionId') transactionId: string,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.confirmPayment(
      id,
      transactionId,
    );
    return createSuccessResponse(payment, 'Pago confirmado exitosamente');
  }

  @ApiOperation({ summary: 'Cancelar un pago' })
  @ApiParam({ name: 'id', description: 'ID del Pago a cancelar', type: String })
  @ApiResponse({
    status: 200,
    description: 'Pago cancelado',
    type: PaymentSerializer,
  })
  // @RequirePermissions(PaymentPermissionsEnum.UPDATE) // Ejemplo de permiso
  @Patch(':id/cancel')
  async cancelPayment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.cancelPayment(id);
    return createSuccessResponse(payment, 'Pago cancelado exitosamente');
  }

  @ApiOperation({ summary: 'Marcar un pago como fallido' })
  @ApiParam({
    name: 'id',
    description: 'ID del Pago a marcar como fallido',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pago marcado como fallido',
    type: PaymentSerializer,
  })
  // @RequirePermissions(PaymentPermissionsEnum.UPDATE) // Ejemplo de permiso
  @Patch(':id/fail')
  async failPayment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.failPayment(id);
    return createSuccessResponse(
      payment,
      'Pago marcado como fallido exitosamente',
    );
  }

  @ApiOperation({ summary: 'Procesar un reembolso para un pago' })
  @ApiParam({
    name: 'id',
    description: 'ID del Pago a reembolsar',
    type: String,
  })
  // Podrías añadir un Body aquí si necesitas datos para el reembolso (ej. monto parcial)
  @ApiResponse({
    status: 200,
    description: 'Pago reembolsado',
    type: PaymentSerializer,
  })
  // @RequirePermissions(PaymentPermissionsEnum.REFUND) // Ejemplo de permiso
  @Post(':id/refund')
  async refundPayment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.refundPayment(id);
    return createSuccessResponse(payment, 'Pago reembolsado exitosamente');
  }

  @ApiOperation({ summary: 'Obtener recibo de un pago' })
  @ApiParam({ name: 'id', description: 'ID del Pago', type: String })
  @ApiResponse({
    status: 200,
    description: 'Recibo del pago',
    schema: { type: 'object' }, // Ajustar schema según la estructura del recibo
  })
  // @RequirePermissions(PaymentPermissionsEnum.VIEW) // Ejemplo de permiso
  @Get(':id/receipt')
  async getPaymentReceipt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<any>> {
    const receipt = await this.paymentsService.getPaymentReceipt(id);
    return createSuccessResponse(receipt, 'Recibo obtenido exitosamente');
  }

  @ApiOperation({ summary: 'Actualizar un pago (uso general)' })
  @ApiParam({
    name: 'id',
    description: 'ID del Pago a actualizar',
    type: String,
  })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Pago actualizado',
    type: PaymentSerializer,
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  // @RequirePermissions(PaymentPermissionsEnum.UPDATE) // Ejemplo de permiso
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<ISuccessResponse<PaymentSerializer>> {
    const payment = await this.paymentsService.update(id, updatePaymentDto);
    return createSuccessResponse(payment, 'Pago actualizado exitosamente');
  }

  @ApiOperation({ summary: 'Eliminar un pago' })
  @ApiParam({ name: 'id', description: 'ID del Pago a eliminar', type: String })
  @ApiResponse({ status: 204, description: 'Pago eliminado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  // @RequirePermissions(PaymentPermissionsEnum.DELETE) // Ejemplo de permiso
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.paymentsService.delete(id);
    // No se retorna contenido, la respuesta es 204 No Content
  }
}
