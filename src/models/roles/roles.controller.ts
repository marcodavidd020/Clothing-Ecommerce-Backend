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
  Query,
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
import { RolesService } from './roles.service';
import { RoleSerializer } from './serializers/role.serializer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/metadata/permissions.metadata';
import {
  createSuccessResponse,
  createCreatedResponse,
} from '../../common/helpers/responses/success.helper';
import { ISuccessResponse } from '../../common/interfaces/response.interface';
import { createNotFoundResponse } from '../../common/helpers/responses/error.helper';
import { PermissionPermissionsEnum } from '../permissions/constants/permission-permissions';
import { RolePermissionsEnum } from './constants/role-permissions';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles',
    type: RoleSerializer,
    isArray: true,
  })
  @Get()
  @RequirePermissions(RolePermissionsEnum.VIEW)
  async findAll(): Promise<ISuccessResponse<RoleSerializer[]>> {
    const roles = await this.rolesService.findAll();
    return createSuccessResponse(roles, 'Roles recuperados exitosamente');
  }

  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado',
    type: RoleSerializer,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Get(':id')
  @RequirePermissions(RolePermissionsEnum.VIEW)
  async findById(
    @Param('id') id: string,
  ): Promise<ISuccessResponse<RoleSerializer>> {
    try {
      const role = await this.rolesService.findById(id);
      return createSuccessResponse(role, `Rol ${role.name} encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(createNotFoundResponse('Rol'));
    }
  }

  @ApiOperation({ summary: 'Crear nuevo rol' })
  @ApiResponse({
    status: 201,
    description: 'Rol creado',
    type: RoleSerializer,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El slug ya está en uso' })
  @Post()
  @RequirePermissions(RolePermissionsEnum.CREATE)
  async create(
    @Body() roleData: { name: string; slug: string },
  ): Promise<ISuccessResponse<RoleSerializer>> {
    try {
      const role = await this.rolesService.create(roleData);
      return createCreatedResponse(role, 'Rol');
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error al crear el rol');
    }
  }

  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado',
    type: RoleSerializer,
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Put(':id')
  @RequirePermissions(RolePermissionsEnum.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() roleData: { name?: string; slug?: string },
  ): Promise<ISuccessResponse<RoleSerializer>> {
    const role = await this.rolesService.update(id, roleData);
    return createSuccessResponse(role, 'Rol actualizado correctamente');
  }

  @ApiOperation({ summary: 'Eliminar rol' })
  @ApiResponse({ status: 204, description: 'Rol eliminado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(RolePermissionsEnum.DELETE)
  async delete(@Param('id') id: string): Promise<void> {
    await this.rolesService.delete(id);
  }

  @ApiOperation({ summary: 'Asignar permiso a rol' })
  @ApiResponse({ status: 204, description: 'Permiso asignado' })
  @Post(':roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionPermissionsEnum.ASSIGN)
  async assignPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.rolesService.assignPermissionToRole(roleId, permissionId);
  }

  @ApiOperation({ summary: 'Revocar permiso de rol' })
  @ApiResponse({ status: 204, description: 'Permiso revocado' })
  @Delete(':roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionPermissionsEnum.ASSIGN)
  async revokePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.rolesService.revokePermissionFromRole(roleId, permissionId);
  }

  @ApiOperation({ summary: 'Asignar rol a usuario' })
  @ApiResponse({ status: 204, description: 'Rol asignado' })
  @Post('assign/:roleId/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(RolePermissionsEnum.ASSIGN)
  async assignRoleToUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.rolesService.assignRoleToUser(userId, roleId);
  }

  @ApiOperation({ summary: 'Revocar rol de usuario' })
  @ApiResponse({ status: 204, description: 'Rol revocado' })
  @Delete('revoke/:roleId/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(RolePermissionsEnum.ASSIGN)
  async revokeRoleFromUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.rolesService.revokeRoleFromUser(userId, roleId);
  }
}
