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
  ConflictException,
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
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/metadata/permissions.metadata';
import { AddressPermissionsEnum } from 'src/common/constants/permissions.enum';
import { serializeModel } from '../common/serializers/model.serializer';

@ApiTags('Direcciones')
@ApiBearerAuth('JWT-auth')
@Controller('addresses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @RequirePermissions(AddressPermissionsEnum.VIEW)
  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query() paginationDto?: PaginationDto,
  ): Promise<ISuccessResponse<AddressSerializer[]>> {
    try {
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
    } catch (error) {
      throw new ConflictException(
        createErrorResponse('Error al obtener las direcciones'),
      );
    }
  }

  @ApiOperation({ summary: 'Obtener dirección por ID' })
  @ApiResponse({
    status: 200,
    description: 'Dirección encontrada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @RequirePermissions(AddressPermissionsEnum.VIEW)
  @Get(':id')
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    try {
      const address = await this.addressesService.findById(id);
      if (!address) {
        throw new NotFoundException(createNotFoundResponse('Dirección'));
      }
      return createSuccessResponse(
        new AddressSerializer(address),
        'Dirección encontrada exitosamente',
      );
    } catch (error) {
      throw new ConflictException(
        createErrorResponse('Error al obtener la dirección'),
      );
    }
  }

  @ApiOperation({ summary: 'Crear nueva dirección' })
  @ApiResponse({
    status: 201,
    description: 'Dirección creada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @RequirePermissions(AddressPermissionsEnum.CREATE)
  @Post()
  async create(
    @Body() addressData: CreateAddressDto,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    try {
      const address = await this.addressesService.create(addressData);
      const serializedAddress = serializeModel(address, AddressSerializer);

      return createCreatedResponse(serializedAddress, 'Dirección');
    } catch (error) {
      throw new ConflictException(
        createErrorResponse('Error al crear la dirección'),
      );
    }
  }

  @ApiOperation({ summary: 'Actualizar dirección' })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada',
    type: AddressSerializer,
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @RequirePermissions(AddressPermissionsEnum.UPDATE)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() addressData: UpdateAddressDto,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    try {
      const address = await this.addressesService.update(id, addressData);
      if (!address) {
        throw new NotFoundException(createNotFoundResponse('Dirección'));
      }
      const serializedAddress = serializeModel(address, AddressSerializer);
      return createSuccessResponse(
        serializedAddress,
        'Dirección actualizada exitosamente',
      );
    } catch (error) {
      throw new ConflictException(
        createErrorResponse('Error al actualizar la dirección'),
      );
    }
  }

  @ApiOperation({ summary: 'Eliminar dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @RequirePermissions(AddressPermissionsEnum.DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<ISuccessResponse<null>> {
    try {
      await this.addressesService.delete(id);
      return createSuccessResponse(null, 'Dirección eliminada exitosamente');
    } catch (error) {
      throw new ConflictException(
        createErrorResponse('Error al eliminar la dirección'),
      );
    }
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
  @RequirePermissions(AddressPermissionsEnum.UPDATE)
  @Put(':id/default')
  async setAsDefault(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<ISuccessResponse<AddressSerializer>> {
    try {
      const address = await this.addressesService.setAsDefault(id, userId);
      const serializedAddress = serializeModel(address, AddressSerializer);
      return createSuccessResponse(
        serializedAddress,
        'Dirección establecida como predeterminada exitosamente',
      );
    } catch (error) {
      throw new ConflictException(
        createErrorResponse(
          'Error al establecer la dirección como predeterminada',
        ),
      );
    }
  }
}
