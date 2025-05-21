import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  name: string;

  @Column({ nullable: true, type: 'text' })
  image: string | null;

  @Column({ unique: true, nullable: false })
  @Index({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'discount_price',
  })
  discountPrice: number | null;

  @Column({ type: 'integer', nullable: false, default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: ProductImage[];

  // Métodos de negocio

  /**
   * Aplica un descuento al producto.
   * El descuento se aplica sobre el precio original.
   * @param percentage Porcentaje de descuento (ej: 0.10 para 10%)
   */
  applyDiscountPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 1) {
      throw new Error('El porcentaje de descuento debe estar entre 0 y 1.');
    }
    // Asegurarse de que price sea un número antes de operar
    const currentPrice = Number(this.price);
    if (isNaN(currentPrice)) {
      throw new Error('El precio base del producto no es válido.');
    }
    this.discountPrice = parseFloat(
      (currentPrice * (1 - percentage)).toFixed(2),
    );
  }

  /**
   * Aplica un monto de descuento fijo.
   * El precio descontado no puede ser negativo.
   * @param amount Monto del descuento (ej: 10 para $10 de descuento)
   */
  applyFixedDiscount(amount: number): void {
    if (amount < 0) {
      throw new Error('El monto del descuento no puede ser negativo.');
    }
    const currentPrice = Number(this.price);
    if (isNaN(currentPrice)) {
      throw new Error('El precio base del producto no es válido.');
    }
    const finalPrice = currentPrice - amount;
    this.discountPrice = finalPrice < 0 ? 0 : parseFloat(finalPrice.toFixed(2));
  }

  /**
   * Remueve cualquier descuento aplicado al producto.
   */
  removeDiscount(): void {
    this.discountPrice = null;
  }

  /**
   * Cambia el stock del producto.
   * @param amount Cantidad a añadir (positivo) o remover (negativo) del stock.
   */
  changeStock(amount: number): void {
    const newStock = this.stock + amount;
    if (newStock < 0) {
      // Decidir si lanzar error o simplemente fijar a 0
      // Por ahora, lanzamos error para una gestión más estricta
      throw new Error('El stock no puede ser negativo.');
    }
    this.stock = newStock;
  }
}
