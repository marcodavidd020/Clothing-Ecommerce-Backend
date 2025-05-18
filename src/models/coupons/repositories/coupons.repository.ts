import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Coupon } from '../entities/coupon.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { CouponSerializer } from '../serializers/coupon.serializer';
import { ICouponCreate, ICouponUpdate } from '../interfaces/coupon.interface';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class CouponsRepository extends ModelRepository<
  Coupon,
  CouponSerializer
> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(CouponSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Coupon);
    this.metadata = this.repository.metadata;
  }

  async findById(id: string): Promise<CouponSerializer | null> {
    const coupon = await this.repository.findOne({
      where: { id, isActive: true },
    });
    return coupon ? this.transform(coupon) : null;
  }

  async findByCode(code: string): Promise<CouponSerializer | null> {
    const coupon = await this.repository.findOne({
      where: { code, isActive: true },
    });
    return coupon ? this.transform(coupon) : null;
  }

  async findRawByCode(code: string): Promise<Coupon | null> {
    return this.repository.findOne({
      where: { code, isActive: true },
    });
  }

  async createCoupon(data: ICouponCreate): Promise<CouponSerializer> {
    const couponToCreate = this.repository.create({
      ...data,
      isActive: data.isActive === undefined ? true : data.isActive,
    });
    const newCoupon = await this.repository.save(couponToCreate);
    return this.transform(newCoupon);
  }

  async updateCoupon(
    id: string,
    data: ICouponUpdate,
  ): Promise<CouponSerializer | null> {
    const coupon = await this.repository.findOneBy({ id, isActive: true });
    if (!coupon) {
      return null;
    }
    // Si se pasa explícitamente isActive: false, se permite la desactivación.
    // Si no se pasa isActive, no se cambia.
    // Si se pasa isActive: true, se activa (si estaba inactivo).
    const updateData = { ...data };
    if (data.isActive === undefined) {
      delete updateData.isActive; // No actualizar isActive si no se proporciona
    }

    await this.repository.update(id, updateData);
    const updatedCoupon = await this.repository.findOneBy({ id }); // Recargar para obtener la entidad actualizada
    return updatedCoupon ? this.transform(updatedCoupon) : null;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    // Soft delete
    const coupon = await this.repository.findOneBy({ id, isActive: true });
    if (!coupon) {
      return false;
    }
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  async incrementUsedCount(id: string): Promise<void> {
    // Esta lógica dependerá de cómo se maneje `maxUses` y `userCoupons`.
    // Si `maxUses` es un campo en `Coupon` que se decrementa:
    // await this.repository.decrement({ id, isActive: true }, 'maxUses', 1);
    // Por ahora, esta función es un placeholder ya que la cuenta de usos se deriva de `UserCoupon`.
    console.warn('incrementUsedCount es un placeholder en CouponsRepository');
  }

  async paginate(
    options: IPaginationOptions = {},
    relations: string[] = [],
    customWhere?: FindOptionsWhere<Coupon>,
  ): Promise<IPaginatedResult<CouponSerializer>> {
    const defaultWhere: FindOptionsWhere<Coupon> = {
      isActive: true,
      ...customWhere,
    };
    return super.paginate(options, relations, defaultWhere);
  }
}
