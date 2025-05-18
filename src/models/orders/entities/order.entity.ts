import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusEnum } from '../constants/order.enums';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../payments/constants/payment.enums'; // Reutilizando enums de pagos

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Index()
  @Column('uuid', { name: 'user_id', nullable: true })
  user_id: string | null;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'address_id' })
  address: Address | null; // Dirección de envío

  @Index()
  @Column('uuid', { name: 'address_id', nullable: true })
  address_id: string | null;

  @ManyToOne(() => Payment, { onDelete: 'SET NULL', nullable: true, cascade: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment | null;

  @Index()
  @Column('uuid', { name: 'payment_id', nullable: true })
  payment_id: string | null;

  @ManyToOne(() => Coupon, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @Index()
  @Column('uuid', { name: 'coupon_id', nullable: true })
  coupon_id: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'varchar',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING_PAYMENT,
  })
  @Index()
  status: OrderStatusEnum;

  @Column({
    type: 'varchar',
    enum: PaymentStatusEnum,
    name: 'payment_status',
    nullable: true, // Puede ser nulo hasta que se intente un pago
  })
  @Index()
  paymentStatus: PaymentStatusEnum | null;

  @Column({
    type: 'varchar',
    enum: PaymentMethodEnum,
    name: 'payment_method',
    nullable: true, // Puede ser nulo hasta que se intente un pago
  })
  paymentMethod: PaymentMethodEnum | null;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: false, // Cargar items explícitamente cuando se necesiten
  })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Métodos de la clase Order según el diagrama (la lógica principal estará en el servicio)
  // Estos son más conceptuales a nivel de entidad.

  /**
   * Conceptual: Inicia el proceso de la orden.
   * La lógica real (validaciones, creación de pago, etc.) estará en el servicio.
   */
  place(): void {
    if (this.status !== OrderStatusEnum.PENDING_PAYMENT) {
      // O un estado inicial previo si lo hubiera
      // Lógica para cambiar estado si es necesario, ej. a OrderStatusEnum.PROCESSING
      // pero esto usualmente lo maneja el servicio post-pago.
      console.log('Placing order logic in entity (conceptual)');
    }
  }

  /**
   * Conceptual: Cancela la orden.
   * La lógica real (reversión de stock, etc.) estará en el servicio.
   */
  cancel(): void {
    if (
      this.status === OrderStatusEnum.DELIVERED ||
      this.status === OrderStatusEnum.COMPLETED ||
      this.status === OrderStatusEnum.SHIPPED ||
      this.status === OrderStatusEnum.CANCELLED
    ) {
      throw new Error(`Order in status ${this.status} cannot be cancelled.`);
    }
    this.status = OrderStatusEnum.CANCELLED;
  }

  /**
   * Conceptual: Obtiene un resumen de la orden.
   * La lógica real estará en el servicio o serializador.
   */
  getSummary(): { id: string; total: number; status: string; itemCount: number } {
    return {
      id: this.id,
      total: this.totalAmount,
      status: this.status,
      itemCount: this.items?.length || 0,
    };
  }

  /**
   * Conceptual: Actualiza el estado de la orden.
   * La lógica real con validaciones de transición estará en el servicio.
   * @param newStatus El nuevo estado de la orden.
   */
  updateStatus(newStatus: OrderStatusEnum): void {
    // Aquí podrían ir validaciones de transición de estados si se quiere a nivel de entidad
    this.status = newStatus;
  }
} 