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

  @Column({ default: true })
  isActive: boolean;

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
      throw new Error(
        'Solo se puede iniciar un pago que está en estado PENDIENTE.',
      );
    }
    // Lógica adicional para iniciar el pago si es necesario
    // Por ejemplo, cambiar el estado a PROCESANDO si fuera un paso intermedio
    // this.status = PaymentStatusEnum.PROCESSING;
  }

  /**
   * Confirma el pago.
   * @param transactionId El ID de la transacción del proveedor.
   */
  confirm(transactionId: string): void {
    if (
      this.status !== PaymentStatusEnum.PENDING &&
      this.status !== PaymentStatusEnum.PROCESSING
    ) {
      throw new Error(
        'Solo se puede confirmar un pago que está en estado PENDIENTE o PROCESANDO.',
      );
    }
    if (!transactionId) {
      throw new Error(
        'Se requiere un ID de transacción para confirmar el pago.',
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
      this.status === PaymentStatusEnum.REFUNDED ||
      this.status === PaymentStatusEnum.CANCELLED
    ) {
      throw new Error(`No se puede cancelar un pago en estado ${this.status}.`);
    }
    this.status = PaymentStatusEnum.CANCELLED;
  }

  /**
   * Marca el pago como fallido.
   */
  fail(): void {
    if (
      this.status === PaymentStatusEnum.PAID ||
      this.status === PaymentStatusEnum.REFUNDED ||
      this.status === PaymentStatusEnum.FAILED
    ) {
      throw new Error(
        `No se puede marcar como fallido un pago en estado ${this.status}.`,
      );
    }
    this.status = PaymentStatusEnum.FAILED;
  }

  /**
   * Procesa un reembolso.
   */
  refund(): void {
    if (this.status !== PaymentStatusEnum.PAID) {
      throw new Error(
        'Solo se puede reembolsar un pago que está en estado PAGADO.',
      );
    }
    this.status = PaymentStatusEnum.REFUNDED;
    // Lógica adicional para el reembolso (ej. interactuar con el proveedor)
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
      status: this.status.toString(),
      date: this.updatedAt, // O createdAt, según la lógica de negocio
    };
  }

  softDelete(): void {
    if (!this.isActive) {
      throw new Error('El pago ya ha sido eliminado.');
    }
    this.isActive = false;
  }
}
