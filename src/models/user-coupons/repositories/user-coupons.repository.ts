import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, IsNull, Not } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserCoupon } from '../entities/user-coupon.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { UserCouponSerializer } from '../serializers/user-coupon.serializer';
import {
  IUserCouponCreate,
  IUserCouponUpdate,
} from '../interfaces/user-coupon.interface';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class UserCouponsRepository extends ModelRepository<
  UserCoupon,
  UserCouponSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserCouponSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(UserCoupon);
    this.metadata = this.repository.metadata;
  }

  async findById(
    id: string,
    relations: string[] = ['user', 'coupon'],
  ): Promise<UserCouponSerializer | null> {
    const userCoupon = await this.repository.findOne({
      where: { id, isActive: true },
      relations,
    });
    return userCoupon ? this.transform(userCoupon) : null;
  }

  async findRawById(
    id: string,
    relations: string[] = [],
  ): Promise<UserCoupon | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations,
    });
  }

  async findByUserId(
    userId: string,
    relations: string[] = ['coupon'],
  ): Promise<UserCouponSerializer[]> {
    const userCoupons = await this.repository.find({
      where: { userId, isActive: true },
      relations,
    });
    return this.transformMany(userCoupons);
  }

  async findByCouponId(
    couponId: string,
    relations: string[] = ['user'],
  ): Promise<UserCouponSerializer[]> {
    const userCoupons = await this.repository.find({
      where: { couponId, isActive: true },
      relations,
    });
    return this.transformMany(userCoupons);
  }

  async findByUserAndCoupon(
    userId: string,
    couponId: string,
    relations: string[] = [],
  ): Promise<UserCouponSerializer | null> {
    const userCoupon = await this.repository.findOne({
      where: { userId, couponId, isActive: true },
      relations,
    });
    return userCoupon ? this.transform(userCoupon) : null;
  }

  async createUserCoupon(
    data: IUserCouponCreate,
  ): Promise<UserCouponSerializer> {
    const userCouponToCreate = this.repository.create({
      ...data,
      isActive: data.isActive === undefined ? true : data.isActive,
    });
    const newUserCoupon = await this.repository.save(userCouponToCreate);
    // Recargar con relaciones para el serializador
    const reloaded = await this.findById(newUserCoupon.id);
    return reloaded!;
  }

  async updateUserCoupon(
    id: string,
    data: IUserCouponUpdate,
  ): Promise<UserCouponSerializer | null> {
    const userCoupon = await this.repository.findOneBy({ id, isActive: true });
    if (!userCoupon) {
      return null;
    }
    await this.repository.update(id, data);
    const updatedUserCoupon = await this.findById(id);
    return updatedUserCoupon;
  }

  async markAsUsed(
    id: string,
    usedAt: Date = new Date(),
  ): Promise<UserCouponSerializer | null> {
    const userCouponEntity = await this.findRawById(id);
    if (!userCouponEntity) {
      return null;
    }
    if (userCouponEntity.usedAt) {
      // Considerar lanzar un error o simplemente retornar el existente
      console.warn(`UserCoupon ${id} ya fue marcado como usado.`);
      return this.transform(userCouponEntity);
    }
    userCouponEntity.markAsUsed(); // Llama al método de la entidad
    await this.repository.update(id, { usedAt: userCouponEntity.usedAt });
    const updatedUserCoupon = await this.findById(id, ['user', 'coupon']); // Asegurar que las relaciones se cargan
    return updatedUserCoupon;
  }

  async deleteUserCoupon(id: string): Promise<boolean> {
    // Soft delete
    const userCoupon = await this.repository.findOneBy({ id, isActive: true });
    if (!userCoupon) {
      return false;
    }
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  async countByCouponAndUser(
    couponId: string,
    userId: string,
  ): Promise<number> {
    return this.repository.count({
      where: { couponId, userId, isActive: true, usedAt: IsNull() }, // Contar solo los no usados o según la lógica de negocio
    });
  }

  async countByCouponId(couponId: string): Promise<number> {
    return this.repository.count({
      where: { couponId, isActive: true, usedAt: IsNull() }, // Contar solo los no usados o los que se hayan usado (depende de si maxUses es por asignación o por uso)
    });
  }

  async countTotalUsesByCouponId(couponId: string): Promise<number> {
    return this.repository.count({
      where: { couponId, usedAt: Not(IsNull()) }, // Contar los que tienen una fecha en usedAt
    });
  }

  async paginateByUserId(
    userId: string,
    options: IPaginationOptions = {},
    relations: string[] = ['coupon'],
  ): Promise<IPaginatedResult<UserCouponSerializer>> {
    const defaultWhere: FindOptionsWhere<UserCoupon> = {
      userId,
      isActive: true,
    };
    return super.paginate(options, relations, defaultWhere);
  }

  async findActiveUserCouponByCouponCodeForUser(
    userId: string,
    couponCode: string,
  ): Promise<UserCoupon | null> {
    return this.repository.findOne({
      where: {
        userId,
        coupon: { code: couponCode, isActive: true },
        isActive: true,
        usedAt: IsNull(), // Solo cupones no usados
      },
      relations: ['coupon'], // Cargar el cupón para verificar expiresAt, etc.
    });
  }
}
