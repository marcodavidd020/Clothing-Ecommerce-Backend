import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { CouponDiscountTypeEnum } from '../constants/coupon.enums';
import { UserCoupon } from '../../user-coupons/entities/user-coupon.entity'; // Se creará después

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  code: string;

  @Column({
    type: 'enum',
    enum: CouponDiscountTypeEnum,
    name: 'discount_type',
  })
  discountType: CouponDiscountTypeEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_value' })
  discountValue: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'min_amount',
    nullable: true,
    default: 0,
  })
  minAmount: number;

  @Column({ type: 'integer', name: 'max_uses', nullable: true })
  maxUses: number | null;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserCoupon, (userCoupon) => userCoupon.coupon)
  userCoupons: UserCoupon[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos de la entidad

  /**
   * Valida si el cupón puede ser aplicado (no expirado, usos disponibles, etc.)
   * @param currentOrderAmount - El monto actual de la orden para validar minAmount (opcional)
   */
  validate(currentOrderAmount?: number): boolean {
    if (!this.isActive) return false;
    if (this.isExpired()) return false;

    if (
      this.minAmount &&
      currentOrderAmount &&
      currentOrderAmount < this.minAmount
    ) {
      console.log(
        `El monto de la orden (${currentOrderAmount}) es menor al mínimo requerido por el cupón (${this.minAmount})`,
      );
      return false;
    }

    // La validación de maxUses se haría mejor contando los UserCoupon asociados
    // Aquí solo es una validación conceptual si se tuviera un contador directo en Coupon (no es el caso)
    return true;
  }

  /**
   * Aplica el descuento del cupón a una orden (conceptual).
   * @param order - La orden a la que se aplicará el descuento (se asume una interfaz).
   */
  applyToOrder(order: {
    totalAmount: number;
    discountApplied?: number;
  }): number {
    if (!this.validate(order.totalAmount)) {
      throw new Error('El cupón no es válido para esta orden.');
    }

    let discount = 0;
    if (this.discountType === CouponDiscountTypeEnum.FIXED_AMOUNT) {
      discount = this.discountValue;
    } else if (this.discountType === CouponDiscountTypeEnum.PERCENTAGE) {
      discount = order.totalAmount * (this.discountValue / 100); // Asumiendo que discountValue es 10 para 10%
    }

    // Asegurar que el descuento no sea mayor que el total de la orden
    discount = Math.min(discount, order.totalAmount);
    order.discountApplied = discount;
    return order.totalAmount - discount;
  }

  /**
   * Verifica si el cupón ha expirado.
   */
  isExpired(): boolean {
    return this.expiresAt
      ? this.expiresAt.getTime() < new Date().getTime()
      : false;
  }
}
