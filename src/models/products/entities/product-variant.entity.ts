import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  color: string;

  @Column()
  size: string;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * Añade stock a la variante.
   * @param amount Cantidad a añadir (debe ser positiva).
   */
  addStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('La cantidad para añadir al stock debe ser positiva.');
    }
    this.stock += amount;
  }

  /**
   * Remueve stock de la variante.
   * @param amount Cantidad a remover (debe ser positiva).
   */
  removeStock(amount: number): void {
    if (amount <= 0) {
      throw new Error('La cantidad para remover del stock debe ser positiva.');
    }
    const newStock = this.stock - amount;
    if (newStock < 0) {
      // Decidir si lanzar error o simplemente fijar a 0
      // Por ahora, lanzamos error para una gestión más estricta
      throw new Error('El stock no puede ser negativo.');
    }
    this.stock = newStock;
  }

  /**
   * Actualiza los detalles de la variante.
   * @param details Objeto con los campos a actualizar (color, size, stock).
   */
  updateDetails(details: {
    color?: string;
    size?: string;
    stock?: number;
  }): void {
    if (details.color !== undefined) {
      this.color = details.color;
    }
    if (details.size !== undefined) {
      this.size = details.size;
    }
    if (details.stock !== undefined) {
      if (details.stock < 0) {
        throw new Error(
          'El stock no puede ser negativo al actualizar detalles.',
        );
      }
      this.stock = details.stock;
    }
  }
}
