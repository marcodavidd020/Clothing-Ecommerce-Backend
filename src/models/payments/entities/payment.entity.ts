import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../constants/payment.enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  provider: string; // Ej: 'Stripe', 'PayPal', 'Manual'

  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
  })
  method: PaymentMethodEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  @Index()
  status: PaymentStatusEnum;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  @Index()
  transactionId: string | null; // ID de la transacción del proveedor

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos de la entidad (la lógica principal residirá en el servicio)

  /**
   * Inicia el proceso de pago (conceptual, la creación se hace en el servicio).
   */
  initiate(): void {
    if (this.status !== PaymentStatusEnum.PENDING) {
      throw new Error('Solo se pueden iniciar pagos en estado PENDIENTE.');
    }
    this.status = PaymentStatusEnum.PROCESSING;
    // Lógica adicional podría ir aquí si es puramente de estado de la entidad.
  }

  /**
   * Confirma el pago.
   * @param transactionId El ID de la transacción del proveedor.
   */
  confirm(transactionId: string): void {
    if (
      this.status !== PaymentStatusEnum.PROCESSING &&
      this.status !== PaymentStatusEnum.PENDING
    ) {
      throw new Error(
        'Solo se pueden confirmar pagos en estado PROCESANDO o PENDIENTE.',
      );
    }
    this.status = PaymentStatusEnum.PAID;
    this.transactionId = transactionId;
  }

  /**
   * Cancela el pago.
   */
  cancel(): void {
    if (
      this.status === PaymentStatusEnum.PAID ||
      this.status === PaymentStatusEnum.REFUNDED
    ) {
      throw new Error(
        'No se puede cancelar un pago que ya fue PAGADO o REEMBOLSADO.',
      );
    }
    this.status = PaymentStatusEnum.CANCELLED;
  }

  /**
   * Marca el pago como fallido.
   */
  fail(): void {
    if (
      this.status === PaymentStatusEnum.PAID ||
      this.status === PaymentStatusEnum.REFUNDED
    ) {
      throw new Error(
        'No se puede marcar como fallido un pago que ya fue PAGADO o REEMBOLSADO.',
      );
    }
    this.status = PaymentStatusEnum.FAILED;
  }

  /**
   * Procesa un reembolso.
   */
  refund(): void {
    if (this.status !== PaymentStatusEnum.PAID) {
      throw new Error('Solo se pueden reembolsar pagos en estado PAGADO.');
    }
    this.status = PaymentStatusEnum.REFUNDED;
    // Lógica adicional como registrar el monto reembolsado podría ir aquí
    // o en una entidad separada de Reembolso.
  }

  /**
   * Verifica si el pago fue exitoso.
   */
  isSuccessful(): boolean {
    return this.status === PaymentStatusEnum.PAID;
  }

  /**
   * Obtiene los datos para un recibo (conceptual).
   * La generación del recibo completo estaría en el servicio.
   */
  getReceipt(): { id: string; amount: number; status: string; date: Date } {
    return {
      id: this.id,
      amount: this.amount,
      status: this.status,
      date: this.createdAt,
    };
  }
}
