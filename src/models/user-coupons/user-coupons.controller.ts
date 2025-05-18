import {
  Controller,
  Get,
  Post,
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
import { UserCouponsService } from './user-coupons.service';
import { UserCouponSerializer } from './serializers/user-coupon.serializer';
import { CreateUserCouponDto } from './dto/create-user-coupon.dto';
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
import { UserCouponPermissionsEnum } from './constants/user-coupon-permissions';
import { LoggedInUser } from 'src/common/decorators/requests/logged-in-user.decorator';
import { IJwtUser } from 'src/authentication/interfaces/jwt-user.interface';
import { MarkUserCouponAsUsedDto } from './dto/mark-user-coupon-as-used.dto';

@ApiTags('Cupones de Usuario')
@ApiBearerAuth('JWT-auth')
@Controller('user-coupons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserCouponsController {
  constructor(private readonly userCouponsService: UserCouponsService) {}

  @ApiOperation({ summary: 'Obtener mis cupones asignados (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de mis cupones asignados paginados',
    schema: paginatedResponseSchema(
      '#/components/schemas/UserCouponSerializer',
    ),
  })
  @RequirePermissions(UserCouponPermissionsEnum.VIEW_OWN)
  @Get('my-coupons')
  async findMyCoupons(
    @LoggedInUser() user: IJwtUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<UserCouponSerializer[]>> {
    const paginatedResult =
      await this.userCouponsService.findUserCouponsByUserId(
        user.id,
        paginationDto,
      );
    return createPaginatedResponse(
      paginatedResult,
      'Mis cupones recuperados exitosamente',
    );
  }

  @ApiOperation({ summary: '(Admin) Asignar un cupón a un usuario' })
  @ApiBody({ type: CreateUserCouponDto })
  @ApiResponse({
    status: 201,
    description: 'Cupón asignado al usuario exitosamente',
    type: UserCouponSerializer,
  })
  @RequirePermissions(UserCouponPermissionsEnum.ASSIGN)
  @Post()
  async assignCouponToUser(
    @Body() createUserCouponDto: CreateUserCouponDto,
  ): Promise<ISuccessResponse<UserCouponSerializer>> {
    const userCoupon =
      await this.userCouponsService.assignCouponToUser(createUserCouponDto);
    return createCreatedResponse(userCoupon, 'Asignación de cupón');
  }

  @ApiOperation({ summary: 'Marcar un cupón asignado como usado' })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación del cupón (UserCoupon ID)',
  })
  @ApiBody({ type: MarkUserCouponAsUsedDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Cupón marcado como usado',
    type: UserCouponSerializer,
  })
  @RequirePermissions(UserCouponPermissionsEnum.MARK_AS_USED)
  @Patch(':id/use')
  async markAsUsed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() markAsUsedDto?: MarkUserCouponAsUsedDto, // El DTO puede ser opcional
  ): Promise<ISuccessResponse<UserCouponSerializer>> {
    const userCoupon = await this.userCouponsService.markCouponAsUsedForUser(
      id,
      markAsUsedDto,
    );
    return createSuccessResponse(
      userCoupon,
      'Cupón marcado como usado exitosamente',
    );
  }

  @ApiOperation({
    summary: '(Admin) Obtener una asignación de cupón por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID de la asignación UserCoupon' })
  @ApiResponse({ status: 200, type: UserCouponSerializer })
  @RequirePermissions(UserCouponPermissionsEnum.VIEW_ALL)
  @Get(':id')
  async getUserCouponById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ISuccessResponse<UserCouponSerializer>> {
    const userCoupon = await this.userCouponsService.findUserCouponById(id);
    return createSuccessResponse(userCoupon, 'Asignación de cupón recuperada.');
  }

  @ApiOperation({
    summary: '(Admin) Revocar/eliminar una asignación de cupón (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asignación UserCoupon a eliminar',
  })
  @ApiResponse({ status: 204, description: 'Asignación de cupón eliminada' })
  @RequirePermissions(UserCouponPermissionsEnum.REVOKE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeCouponFromUser(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.userCouponsService.removeCouponFromUser(id);
  }
}
