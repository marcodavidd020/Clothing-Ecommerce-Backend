import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' }) // Asumiendo que User tendrá user.reviews
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column('uuid', { name: 'order_item_id' })
  orderItemId: string;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.reviews, {
    onDelete: 'CASCADE',
  }) // Asumiendo que OrderItem tendrá orderItem.reviews
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column('integer')
  rating: number; // Por ejemplo, 1 a 5

  @Column('text', { nullable: true })
  comment: string | null;

  @Column({ default: true })
  isActive: boolean; // Para soft delete

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  /**
   * Actualiza los detalles de la reseña.
   * Los métodos de entidad como este son más para manipulación directa del objeto antes de guardar,
   * la lógica de negocio principal y validaciones estarán en el servicio.
   */
  updateDetails(rating?: number, comment?: string | null): void {
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new Error('La calificación debe estar entre 1 y 5.');
      }
      this.rating = rating;
    }
    if (comment !== undefined) {
      this.comment = comment;
    }
  }

  // El método markUpdated() es manejado automáticamente por @UpdateDateColumn
  // Los métodos add() y delete() del diagrama de clases se implementan en el servicio/repositorio.
}
