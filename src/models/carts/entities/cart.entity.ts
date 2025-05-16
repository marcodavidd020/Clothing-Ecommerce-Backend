import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { unique: true })
  user_id: string;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Métodos de la entidad (la lógica principal estará en el servicio)

  /**
   * Elimina todos los items del carrito.
   * La persistencia se maneja en el servicio.
   */
  clear(): void {
    this.items = [];
  }

  /**
   * Calcula el total del carrito.
   * Este es un ejemplo, podría necesitar acceso a los precios de ProductVariant.
   * Por ahora, asumiremos que ProductVariant tiene una propiedad 'price'.
   */
  getTotal(): number {
    if (!this.items) {
      return 0;
    }
    // Asumiendo que ProductVariant tiene 'price' y CartItem tiene 'productVariant'
    // return this.items.reduce((total, item) => total + item.quantity * (item.productVariant?.price || 0), 0);
    // Como no tenemos la entidad ProductVariant completamente definida aqui, lo dejamos como placeholder
    // La lógica real estará en el servicio que puede acceder a la información de precios.
    console.warn(
      'La función getTotal() en la entidad Cart es un placeholder. La lógica real con precios debe estar en el servicio.',
    );
    return this.items.reduce((total, item) => total + item.quantity, 0); // Ejemplo: suma de cantidades
  }

  /**
   * Añade un item al carrito.
   * La persistencia y la lógica de si el item ya existe se maneja en el servicio.
   * @param variantId ID de la variante del producto
   * @param quantity Cantidad
   */
  addItem(variantId: string, quantity: number): void {
    // La lógica de creación/actualización de CartItem y persistencia va en el servicio.
    console.log(
      `Placeholder: Añadir variante ${variantId} con cantidad ${quantity} al carrito ${this.id}`,
    );
  }

  /**
   * Elimina un item del carrito.
   * La persistencia se maneja en el servicio.
   * @param itemId ID del CartItem a eliminar
   */
  removeItem(itemId: string): void {
    // La lógica de encontrar y eliminar el CartItem va en el servicio.
    console.log(`Placeholder: Eliminar item ${itemId} del carrito ${this.id}`);
  }

  /**
   * Actualiza la cantidad de un item en el carrito.
   * La persistencia se maneja en el servicio.
   * @param itemId ID del CartItem a actualizar
   * @param quantity Nueva cantidad
   */
  updateItem(itemId: string, quantity: number): void {
    // La lógica de encontrar y actualizar el CartItem va en el servicio.
    console.log(
      `Placeholder: Actualizar item ${itemId} con cantidad ${quantity} en el carrito ${this.id}`,
    );
  }
}
