import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionSerializer } from './serializers/permission.serializer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/metadata/permissions.metadata';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import { createNotFoundResponse } from '../../common/helpers/responses/error.helper';
import { PermissionPermissionsEnum } from './constants/permission-permissions';

@ApiTags('Permisos')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Obtener todos los permisos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permisos',
    type: PermissionSerializer,
    isArray: true,
  })
  @Get()
  @RequirePermissions(PermissionPermissionsEnum.VIEW)
  async findAll(): Promise<ISuccessResponse<PermissionSerializer[]>> {
    const permissions = await this.permissionsService.findAll();
    return createSuccessResponse(
      permissions,
      'Permisos recuperados exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener permiso por ID' })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado',
    type: PermissionSerializer,
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @Get(':id')
  @RequirePermissions(PermissionPermissionsEnum.VIEW)
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<PermissionSerializer>> {
    try {
      const permission = await this.permissionsService.findById(id);
      return createSuccessResponse(
        permission,
        `Permiso ${permission.name} encontrado`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(createNotFoundResponse('Permiso'));
    }
  }

  @ApiOperation({ summary: 'Crear nuevo permiso' })
  @ApiResponse({
    status: 201,
    description: 'Permiso creado',
    type: PermissionSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El nombre ya está en uso' })
  @Post()
  @RequirePermissions(PermissionPermissionsEnum.CREATE)
  async create(
    @Body() permissionData: { name: string; description?: string },
  ): Promise<ISuccessResponse<PermissionSerializer>> {
    try {
      const permission = await this.permissionsService.create(permissionData);
      return createCreatedResponse(permission, 'Permiso');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error al crear el permiso');
    }
  }

  @ApiOperation({ summary: 'Actualizar permiso' })
  @ApiResponse({
    status: 200,
    description: 'Permiso actualizado',
    type: PermissionSerializer,
  })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @Put(':id')
  @RequirePermissions(PermissionPermissionsEnum.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() permissionData: { name?: string; description?: string },
  ): Promise<ISuccessResponse<PermissionSerializer>> {
    const permission = await this.permissionsService.update(id, permissionData);
    return createSuccessResponse(
      permission,
      'Permiso actualizado correctamente',
    );
  }

  @ApiOperation({ summary: 'Eliminar permiso' })
  @ApiResponse({ status: 204, description: 'Permiso eliminado' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionPermissionsEnum.DELETE)
  async delete(@Param('id') id: string): Promise<void> {
    await this.permissionsService.delete(id);
  }
}
