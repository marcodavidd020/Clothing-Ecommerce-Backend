import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { UserCouponsRepository } from './repositories/user-coupons.repository';
import { UserCouponSerializer } from './serializers/user-coupon.serializer';
import { CreateUserCouponDto } from './dto/create-user-coupon.dto';
import { UpdateUserCouponDto } from './dto/update-user-coupon.dto';
import {
  createNotFoundResponse,
  createErrorResponse,
} from 'src/common/helpers/responses/error.helper';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';
import { UsersRepository } from '../users/repositories/users.repository';
import { CouponsRepository } from '../coupons/repositories/coupons.repository';
import { UserCoupon } from './entities/user-coupon.entity';
import { MarkUserCouponAsUsedDto } from './dto/mark-user-coupon-as-used.dto';

@Injectable()
export class UserCouponsService {
  private readonly logger = new Logger(UserCouponsService.name);

  constructor(
    private readonly userCouponsRepository: UserCouponsRepository,
    private readonly usersRepository: UsersRepository, // Para validar existencia de usuario
    private readonly couponsRepository: CouponsRepository, // Para validar existencia de cupón
  ) {}

  async findUserCouponById(id: string): Promise<UserCouponSerializer> {
    const userCoupon = await this.userCouponsRepository.findById(id);
    if (!userCoupon) {
      throw new NotFoundException(
        createNotFoundResponse('Asignación de cupón'),
      );
    }
    return userCoupon;
  }

  async findUserCouponsByUserId(
    userId: string,
    paginationDto: IPaginationOptions,
  ): Promise<IPaginatedResult<UserCouponSerializer>> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(createNotFoundResponse('Usuario'));
    }
    return this.userCouponsRepository.paginateByUserId(userId, paginationDto);
  }

  async assignCouponToUser(
    dto: CreateUserCouponDto,
  ): Promise<UserCouponSerializer> {
    const { userId, couponId } = dto;

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(createNotFoundResponse('Usuario'));
    }

    const coupon = await this.couponsRepository.findById(couponId);
    if (!coupon) {
      throw new NotFoundException(createNotFoundResponse('Cupón'));
    }

    if (!coupon.isActive) {
      throw new BadRequestException('El cupón no está activo.');
    }
    if (coupon.expiresAt && coupon.expiresAt.getTime() < new Date().getTime()) {
      throw new BadRequestException('El cupón ha expirado.');
    }

    const existingAssignment =
      await this.userCouponsRepository.findByUserAndCoupon(userId, couponId);
    if (existingAssignment && existingAssignment.isActive) {
      // Podríamos decidir si esto es un error o si simplemente devolvemos la asignación existente.
      // Por ahora, lo trataremos como un conflicto si ya está asignado y activo.
      // Si queremos permitir múltiples asignaciones (aunque usualmente no es el caso para un mismo cupón a un mismo usuario)
      // o si queremos reactivar una asignación inactiva, la lógica cambiaría.
      throw new ConflictException(
        'Este cupón ya está asignado a este usuario y está activo.',
      );
    }

    // Lógica de maxUses del cupón ANTES de asignar
    if (coupon.maxUses !== null) {
      const totalUsageCount =
        await this.userCouponsRepository.countByCouponId(couponId);
      if (totalUsageCount >= coupon.maxUses) {
        throw new BadRequestException(
          'Este cupón ha alcanzado su límite máximo de usos globales.',
        );
      }
    }

    try {
      const userCoupon = await this.userCouponsRepository.createUserCoupon(dto);
      this.logger.log(`Cupón ${couponId} asignado al usuario ${userId}`);
      return userCoupon;
    } catch (error) {
      this.logger.error(`Error asignando cupón: ${error.message}`, error.stack);
      throw new ConflictException(
        createErrorResponse('Error al asignar el cupón'),
      );
    }
  }

  async markCouponAsUsedForUser(
    userCouponId: string,
    dto?: MarkUserCouponAsUsedDto,
  ): Promise<UserCouponSerializer> {
    const userCouponEntity = await this.userCouponsRepository.findRawById(
      userCouponId,
      ['coupon'],
    );
    if (!userCouponEntity) {
      throw new NotFoundException(
        createNotFoundResponse('Asignación de cupón de usuario'),
      );
    }

    if (userCouponEntity.usedAt) {
      throw new ConflictException('Este cupón ya ha sido marcado como usado.');
    }

    const couponDetails = userCouponEntity.coupon;
    if (!couponDetails || !couponDetails.isActive) {
      throw new BadRequestException('El cupón asociado no está activo.');
    }
    if (couponDetails.isExpired()) {
      throw new BadRequestException('El cupón asociado ha expirado.');
    }

    // La validación de maxUses se hizo al asignar, pero una doble verificación podría ir aquí
    // si el cupón es de un solo uso global y otro usuario lo usó mientras tanto.
    // Sin embargo, `coupon.maxUses` suele referirse al número de VECES que un cupón puede ser USADO en total,
    // no a cuántos usuarios se puede asignar.
    // Si `maxUses` es para el número total de usos del *código* del cupón:
    // if (couponDetails.maxUses !== null) {
    //     const currentUses = await this.userCouponsRepository.countByCouponIdWhereUsed(couponDetails.id);
    //     if (currentUses >= couponDetails.maxUses) {
    //         throw new BadRequestException('Este cupón ha alcanzado su límite máximo de usos globales.');
    //     }
    // }

    const updatedUserCoupon = await this.userCouponsRepository.markAsUsed(
      userCouponId,
      dto?.usedAt,
    );
    if (!updatedUserCoupon) {
      throw new NotFoundException(
        createNotFoundResponse(
          'Asignación de cupón de usuario al intentar marcar como usado',
        ),
      );
    }
    this.logger.log(`Cupón de usuario ${userCouponId} marcado como usado.`);
    return updatedUserCoupon;
  }

  async updateUserCouponAssignment(
    id: string,
    updateDto: UpdateUserCouponDto,
  ): Promise<UserCouponSerializer> {
    const userCoupon = await this.userCouponsRepository.updateUserCoupon(
      id,
      updateDto,
    );
    if (!userCoupon) {
      throw new NotFoundException(
        createNotFoundResponse('Asignación de cupón'),
      );
    }
    this.logger.log(`Asignación de cupón ${id} actualizada.`);
    return userCoupon;
  }

  async removeCouponFromUser(id: string): Promise<void> {
    // Soft delete
    const success = await this.userCouponsRepository.deleteUserCoupon(id);
    if (!success) {
      throw new NotFoundException(
        createNotFoundResponse('Asignación de cupón'),
      );
    }
    this.logger.log(`Asignación de cupón ${id} eliminada (lógicamente).`);
  }
}
