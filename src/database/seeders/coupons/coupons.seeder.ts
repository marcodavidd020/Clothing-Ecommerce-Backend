import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { CouponDiscountTypeEnum } from '../../../models/coupons/constants/coupon.enums';
import { faker } from '@faker-js/faker';

@Injectable()
export class CouponsSeederService {
  private readonly logger = new Logger(CouponsSeederService.name);

  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Iniciando siembra de cupones...');
    try {
      const count = await this.couponRepository.count();
      if (count > 0) {
        this.logger.log('Los cupones ya están creados, saltando seeder...');
        return;
      }

      const couponsToCreate: Partial<Coupon>[] = [
        {
          code: 'SUMMER20',
          discountType: CouponDiscountTypeEnum.PERCENTAGE,
          discountValue: 20,
          minAmount: 50,
          maxUses: 100,
          expiresAt: faker.date.future({ years: 1 }),
          isActive: true,
        },
        {
          code: 'SAVE10NOW',
          discountType: CouponDiscountTypeEnum.FIXED_AMOUNT,
          discountValue: 10,
          minAmount: 25,
          maxUses: 200,
          expiresAt: (() => {
            const d = new Date();
            d.setMonth(d.getMonth() + 6);
            return d;
          })(),
          isActive: true,
        },
        {
          code: 'WELCOME5',
          discountType: CouponDiscountTypeEnum.FIXED_AMOUNT,
          discountValue: 5,
          minAmount: 0, // Sin mínimo
          maxUses: 500,
          expiresAt: null, // Sin expiración
          isActive: true,
        },
        {
          code: 'EXPIREDCODE',
          discountType: CouponDiscountTypeEnum.PERCENTAGE,
          discountValue: 15,
          minAmount: 30,
          maxUses: 50,
          expiresAt: faker.date.past({ years: 1 }), // Expirado
          isActive: true, // Activo pero expirado
        },
        {
          code: 'INACTIVE25',
          discountType: CouponDiscountTypeEnum.PERCENTAGE,
          discountValue: 25,
          minAmount: 100,
          maxUses: 10,
          expiresAt: faker.date.future({ years: 1 }),
          isActive: false, // Inactivo
        },
      ];

      for (const couponData of couponsToCreate) {
        const coupon = this.couponRepository.create(couponData);
        await this.couponRepository.save(coupon);
      }

      this.logger.log(`Creados ${couponsToCreate.length} cupones de ejemplo.`);
      this.logger.log('Proceso de siembra de cupones completado.');
    } catch (error) {
      this.logger.error('Error durante la siembra de cupones:', error.stack);
    }
  }
}
