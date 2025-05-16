import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity'; // Asumiendo esta ruta

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column('uuid')
  cart_id: string;

  @ManyToOne(() => ProductVariant, { eager: true, onDelete: 'CASCADE' }) // eager para cargar la variante con el item
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column('uuid')
  product_variant_id: string;

  @Column('int')
  quantity: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Métodos de la entidad según el diagrama de clases (la lógica principal estará en el servicio)
  // Estos métodos podrían ser para manipulación directa del objeto, pero las operaciones de BD irán en el servicio/repositorio.

  /**
   * Actualiza la cantidad de este item.
   * La persistencia de este cambio se maneja en el servicio.
   * @param quantity Nueva cantidad
   */
  updateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa.');
    }
    this.quantity = quantity;
  }

  /**
   * Placeholder para la lógica de eliminación.
   * La eliminación real de la base de datos se maneja en el servicio.
   */
  remove(): void {
    // La lógica de eliminación se manejará en el servicio para desasociar y eliminar de la BD.
    console.log(`CartItem con ID ${this.id} marcado para eliminación.`);
  }
}
