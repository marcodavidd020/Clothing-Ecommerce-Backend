import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UserCoupon } from '../../../models/user-coupons/entities/user-coupon.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { faker } from '@faker-js/faker';
import { Seeder } from '../seeder.interface';

@Injectable()
export class UserCouponsSeederService implements Seeder {
  private readonly logger = new Logger(UserCouponsSeederService.name);

  constructor(
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log(
      'Iniciando siembra de asignaciones de cupones a usuarios...',
    );
    try {
      const count = await this.userCouponRepository.count();
      if (count > 0) {
        this.logger.log(
          'Las asignaciones de cupones ya están creadas, saltando seeder...',
        );
        return;
      }

      const users = await this.userRepository.find({ take: 5 }); // Tomar 5 usuarios
      const activeAndValidCoupons = await this.couponRepository.find({
        where: {
          isActive: true,
          expiresAt: IsNull(), // O alguna lógica para asegurar que no esté expirado
        },
        take: 3, // Tomar 3 cupones activos y no expirados (o ajustar lógica de expiración)
      });

      if (users.length === 0 || activeAndValidCoupons.length === 0) {
        this.logger.warn(
          'No hay suficientes usuarios o cupones activos/válidos para crear asignaciones. Saltando seeder.',
        );
        return;
      }

      const userCouponsToCreate: Partial<UserCoupon>[] = [];

      for (const user of users) {
        // Asignar 1 o 2 cupones a cada usuario de la lista de cupones disponibles
        const numberOfCouponsToAssign = faker.number.int({
          min: 1,
          max: Math.min(2, activeAndValidCoupons.length),
        });
        const couponsForThisUser = faker.helpers.arrayElements(
          activeAndValidCoupons,
          numberOfCouponsToAssign,
        );

        for (const coupon of couponsForThisUser) {
          // Evitar asignar el mismo cupón varias veces al mismo usuario en este seeder simple
          const existingAssignment = await this.userCouponRepository.findOne({
            where: { userId: user.id, couponId: coupon.id },
          });
          if (existingAssignment) continue;

          userCouponsToCreate.push({
            userId: user.id,
            couponId: coupon.id,
            isActive: true,
            // usedAt podría ser null o una fecha pasada para simular cupones ya usados
            usedAt: Math.random() > 0.7 ? faker.date.past({ years: 1 }) : null,
          });
        }
      }

      if (userCouponsToCreate.length > 0) {
        for (const ucData of userCouponsToCreate) {
          const userCoupon = this.userCouponRepository.create(ucData);
          await this.userCouponRepository.save(userCoupon);
        }
        this.logger.log(
          `Creadas ${userCouponsToCreate.length} asignaciones de cupones a usuarios.`,
        );
      } else {
        this.logger.log(
          'No se crearon nuevas asignaciones de cupones (posiblemente ya existían o no había datos suficientes).',
        );
      }

      this.logger.log(
        'Proceso de siembra de asignaciones de cupones completado.',
      );
    } catch (error) {
      this.logger.error(
        'Error durante la siembra de asignaciones de cupones:',
        error.stack,
      );
    }
  }
}
