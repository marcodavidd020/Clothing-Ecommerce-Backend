import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
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
import { ReviewsService } from './reviews.service';
import { ReviewSerializer } from './serializers/review.serializer';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/metadata/permissions.metadata';
import { ReviewPermissionsEnum } from './constants/review-permissions';
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

@ApiTags('Reseñas (Reviews)')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Crear una nueva reseña para un item de orden comprado.',
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Reseña creada exitosamente.',
    type: ReviewSerializer,
  })
  @RequirePermissions(ReviewPermissionsEnum.CREATE_OWN_REVIEW)
  @Post()
  async create(
    @LoggedInUser() loggedUser: IJwtUser,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ISuccessResponse<ReviewSerializer>> {
    const review = await this.reviewsService.create(
      createReviewDto,
      loggedUser.id,
    );
    return createCreatedResponse(review, 'Reseña');
  }

  @ApiOperation({ summary: 'Obtener reseñas para un item de orden específico' })
  @ApiParam({
    name: 'orderItemId',
    description: 'ID del item de la orden',
    type: String,
  })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    schema: paginatedResponseSchema('#/components/schemas/ReviewSerializer'),
  })
  @Get('order-item/:orderItemId')
  async findAllByOrderItemId(
    @Param('orderItemId', ParseUUIDPipe) orderItemId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<ReviewSerializer[]>> {
    const paginatedResult = await this.reviewsService.findAllByOrderItemId(
      orderItemId,
      paginationDto,
    );
    return createPaginatedResponse(
      paginatedResult,
      'Reseñas del item recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener mis reseñas (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    schema: paginatedResponseSchema('#/components/schemas/ReviewSerializer'),
  })
  @RequirePermissions(ReviewPermissionsEnum.VIEW_OWN_REVIEWS)
  @Get('my-reviews')
  async findMyReviews(
    @LoggedInUser() loggedUser: IJwtUser,
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<ReviewSerializer[]>> {
    const paginatedResult = await this.reviewsService.findAllByUserId(
      loggedUser.id,
      paginationDto,
    );
    return createPaginatedResponse(
      paginatedResult,
      'Mis reseñas recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: '(Admin) Obtener todas las reseñas (paginado)' })
  @ApiQuery(paginationQueryParams[0])
  @ApiQuery(paginationQueryParams[1])
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las reseñas paginadas',
    schema: paginatedResponseSchema('#/components/schemas/ReviewSerializer'),
  })
  @RequirePermissions(ReviewPermissionsEnum.VIEW_ANY_REVIEW)
  @Get()
  async getAllReviews(
    @Query() paginationDto: PaginationDto,
  ): Promise<ISuccessResponse<ReviewSerializer[]>> {
    const paginatedResult =
      await this.reviewsService.findAllPaginated(paginationDto);
    return createPaginatedResponse(
      paginatedResult,
      'Reseñas recuperadas exitosamente',
    );
  }

  @ApiOperation({ summary: 'Obtener una reseña por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la Reseña', type: String })
  @ApiResponse({ status: 200, type: ReviewSerializer })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  @Get(':id')
  async findOneById(
    @Param('id', ParseUUIDPipe) id: string,
    @LoggedInUser() loggedUser: IJwtUser,
  ): Promise<ISuccessResponse<ReviewSerializer>> {
    const review = await this.reviewsService.findOneById(id);
    return createSuccessResponse(review, 'Reseña encontrada exitosamente');
  }

  @ApiOperation({
    summary: 'Actualizar una reseña propia o cualquier reseña (admin)',
  })
  @ApiParam({ name: 'id', description: 'ID de la Reseña a actualizar' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({ status: 200, type: ReviewSerializer })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  @RequirePermissions(
    ReviewPermissionsEnum.UPDATE_OWN_REVIEW,
    ReviewPermissionsEnum.UPDATE_ANY_REVIEW,
  )
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @LoggedInUser() loggedUser: IJwtUser,
  ): Promise<ISuccessResponse<ReviewSerializer>> {
    const review = await this.reviewsService.update(
      id,
      updateReviewDto,
      loggedUser.id,
    );
    return createSuccessResponse(review, 'Reseña actualizada exitosamente');
  }

  @ApiOperation({
    summary: 'Eliminar una reseña propia o cualquier reseña (admin)',
  })
  @ApiParam({ name: 'id', description: 'ID de la Reseña a eliminar' })
  @ApiResponse({ status: 204, description: 'Reseña eliminada' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
  @RequirePermissions(
    ReviewPermissionsEnum.DELETE_OWN_REVIEW,
    ReviewPermissionsEnum.DELETE_ANY_REVIEW,
  )
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @LoggedInUser() loggedUser: IJwtUser,
  ): Promise<void> {
    await this.reviewsService.remove(id, loggedUser.id);
  }

  @ApiOperation({ summary: '(Admin) Eliminar físicamente una reseña' })
  @ApiParam({
    name: 'id',
    description: 'ID de la reseña a eliminar físicamente',
  })
  @ApiResponse({ status: 204, description: 'Reseña eliminada físicamente' })
  @RequirePermissions(ReviewPermissionsEnum.MANAGE_ANY_REVIEW) // Permiso de alto nivel
  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardRemoveAdmin(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.reviewsService.hardRemoveAdmin(id);
  }
}
