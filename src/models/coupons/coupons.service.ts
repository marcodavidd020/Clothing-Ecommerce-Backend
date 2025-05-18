import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CouponsRepository } from './repositories/coupons.repository';
import { CouponSerializer } from './serializers/coupon.serializer';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import {
  createNotFoundResponse,
  createErrorResponse,
} from 'src/common/helpers/responses/error.helper';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';
import { UserCouponsRepository } from '../user-coupons/repositories/user-coupons.repository'; // Se creará después
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    private readonly couponsRepository: CouponsRepository,
    // Descomentar cuando UserCouponsRepository esté disponible
    private readonly userCouponsRepository: UserCouponsRepository,
  ) {}

  async findAllPaginated(
    options: IPaginationOptions,
  ): Promise<IPaginatedResult<CouponSerializer>> {
    return this.couponsRepository.paginate(options);
  }

  async findById(id: string): Promise<CouponSerializer> {
    const coupon = await this.couponsRepository.findById(id);
    if (!coupon) {
      throw new NotFoundException(createNotFoundResponse('Cupón'));
    }
    return coupon;
  }

  async findByCode(code: string): Promise<CouponSerializer> {
    const coupon = await this.couponsRepository.findByCode(code);
    if (!coupon) {
      throw new NotFoundException(
        createNotFoundResponse(`Cupón con código ${code}`),
      );
    }
    return coupon;
  }

  async create(createCouponDto: CreateCouponDto): Promise<CouponSerializer> {
    const existingCoupon = await this.couponsRepository.findRawByCode(
      createCouponDto.code,
    );
    if (existingCoupon) {
      throw new ConflictException(
        createErrorResponse(
          `El código de cupón '${createCouponDto.code}' ya existe.`,
        ),
      );
    }

    try {
      const coupon = await this.couponsRepository.createCoupon(createCouponDto);
      this.logger.log(`Cupón creado: ${coupon.id} - ${coupon.code}`);
      return coupon;
    } catch (error) {
      this.logger.error(
        `Error al crear el cupón: ${error.message}`,
        error.stack,
      );
      throw new ConflictException(
        createErrorResponse('Error al crear el cupón'),
      );
    }
  }

  async update(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<CouponSerializer> {
    const couponExists = await this.couponsRepository.findById(id);
    if (!couponExists) {
      throw new NotFoundException(createNotFoundResponse('Cupón'));
    }

    if (updateCouponDto.code && updateCouponDto.code !== couponExists.code) {
      const existingByCode = await this.couponsRepository.findRawByCode(
        updateCouponDto.code,
      );
      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException(
          createErrorResponse(
            `El código de cupón '${updateCouponDto.code}' ya está en uso por otro cupón.`,
          ),
        );
      }
    }

    const coupon = await this.couponsRepository.updateCoupon(
      id,
      updateCouponDto,
    );
    if (!coupon) {
      // Esto no debería ocurrir si findById no lanzó error, pero es una doble verificación
      throw new NotFoundException(
        createNotFoundResponse('Cupón al actualizar'),
      );
    }
    this.logger.log(`Cupón actualizado: ${id}`);
    return coupon;
  }

  async delete(id: string): Promise<void> {
    const success = await this.couponsRepository.deleteCoupon(id); // Soft delete
    if (!success) {
      throw new NotFoundException(createNotFoundResponse('Cupón'));
    }
    this.logger.log(`Cupón eliminado (lógicamente): ${id}`);
  }

  /**
   * Valida un cupón para su aplicación.
   * Este método combina las validaciones de la entidad y las de uso.
   */
  async validateCouponForUse(
    code: string,
    orderAmount?: number,
    userId?: string,
  ): Promise<Coupon> {
    const couponEntity = await this.couponsRepository.findRawByCode(code);
    if (!couponEntity) {
      throw new NotFoundException(
        createNotFoundResponse(`Cupón con código ${code}`),
      );
    }

    if (!couponEntity.validate(orderAmount)) {
      throw new BadRequestException(
        'El cupón no es válido, ha expirado o no cumple el monto mínimo.',
      );
    }

    // Validación global de maxUses (contando todos los UserCoupon usados para este coupon_id)
    if (couponEntity.maxUses !== null) {
      const totalTimesUsed =
        await this.userCouponsRepository.countTotalUsesByCouponId(
          couponEntity.id,
        );
      if (totalTimesUsed >= couponEntity.maxUses) {
        throw new BadRequestException(
          'Este cupón ha alcanzado su límite máximo de usos globales.',
        );
      }
    }

    // Nota: La validación de maxUses por usuario (si un mismo usuario puede usar N veces el mismo cupón)
    // se podría añadir aquí si fuera un requisito, usando `countByCouponAndUser`.
    // Por ahora, `maxUses` se interpreta como un límite global de redenciones.

    return couponEntity;
  }

  /**
   * Aplica un cupón a una orden (conceptual).
   * En un escenario real, esto interactuaría con un servicio de Órdenes.
   */
  async applyCouponToOrder(
    code: string,
    order: { totalAmount: number; userId?: string; discountApplied?: number },
  ): Promise<number> {
    const couponEntity = await this.validateCouponForUse(
      code,
      order.totalAmount,
      order.userId,
    );
    return couponEntity.applyToOrder(order);
  }

  async isCouponExpired(code: string): Promise<boolean> {
    const couponEntity = await this.couponsRepository.findRawByCode(code);
    if (!couponEntity) {
      throw new NotFoundException(createNotFoundResponse('Cupón'));
    }
    return couponEntity.isExpired();
  }
}
