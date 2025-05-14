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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { AddressSerializer } from './serializers/address.serializer';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  paginatedResponseSchema,
  paginationQueryParams,
} from '../../common/schemas/pagination.schema';

@ApiTags('Direcciones')
@Controller('addresses')
@UseInterceptors(ClassSerializerInterceptor)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiOperation({ summary: 'Obtener todas las direcciones' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filtrar por ID de usuario',
  })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de direcciones (con o sin paginación)',
    schema: paginatedResponseSchema('#/components/schemas/AddressSerializer'),
  })
  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query() paginationDto?: PaginationDto,
  ): Promise<ISuccessResponse<AddressSerializer[]>> {
    // Si se proporcionan parámetros de paginación, devolvemos resultados paginados
    if (paginationDto?.page || paginationDto?.limit) {
      const paginatedResult = await this.addressesService.findPaginated(
        paginationDto,
        userId,
      );
      return createPaginatedResponse(
        paginatedResult,
        'Direcciones recuperadas exitosamente',
      );
    }

    // Si no hay paginación, usamos la función original
    let addresses: AddressSerializer[];

    if (userId) {
      addresses = await this.addressesService.findByUserId(userId);
    } else {
      addresses = await this.addressesService.findAll();
    }

    return createSuccessResponse(
      addresses.map((address) => new AddressSerializer(address)),
      'Direcciones recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener dirección por ID' })
  @ApiResponse({
    status: 200,
    description: 'Dirección encontrada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    const address = await this.addressesService.findById(id);
    if (!address) {
      throw new NotFoundException(createNotFoundResponse('Dirección'));
    }
    return createSuccessResponse(
      new AddressSerializer(address),
      'Dirección encontrada exitosamente',
    );
  }

  @ApiOperation({ summary: 'Crear nueva dirección' })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Post()
  async create(
    @Body() addressData: CreateAddressDto,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    const address = await this.addressesService.create(addressData);
    return createSuccessResponse(
      new AddressSerializer(address),
      'Dirección creada exitosamente',
    );
  }

  @ApiOperation({ summary: 'Actualizar dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() addressData: UpdateAddressDto,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    const address = await this.addressesService.update(id, addressData);
    if (!address) {
      throw new NotFoundException(createNotFoundResponse('Dirección'));
    }
    return createSuccessResponse(
      new AddressSerializer(address),
      'Dirección actualizada exitosamente',
    );
  }

  @ApiOperation({ summary: 'Eliminar dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<ISuccessResponse<null>> {
    await this.addressesService.delete(id);
    return createSuccessResponse(null, 'Dirección eliminada exitosamente');
  }

  @ApiOperation({ summary: 'Establecer dirección como predeterminada' })
  @ApiResponse({
    status: 200,
    description: 'Dirección establecida como predeterminada',
    type: AddressSerializer,
  })
  @ApiResponse({
    status: 404,
    description: 'Dirección no encontrada o no pertenece al usuario',
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Put(':id/default')
  async setAsDefault(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    const address = await this.addressesService.setAsDefault(id, userId);
    return createSuccessResponse(
      new AddressSerializer(address),
      'Dirección establecida como predeterminada exitosamente',
    );
  }
}
