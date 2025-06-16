import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

@Entity('user_coupons')
export class UserCoupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' }) // Asumiendo que User tendrá una relación userCoupons
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'coupon_id' })
  couponId: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.userCoupons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({ type: 'timestamp', name: 'used_at', nullable: true })
  usedAt: Date | null;

  @Column({ default: true })
  isActive: boolean; // Para soft delete o desactivación

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Marca el cupón como usado para este usuario.
   */
  markAsUsed(): void {
    if (this.usedAt) {
      throw new Error('Este cupón ya ha sido marcado como usado.');
    }
    this.usedAt = new Date();
  }
}
