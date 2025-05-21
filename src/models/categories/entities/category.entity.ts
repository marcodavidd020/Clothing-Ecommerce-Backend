import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeParent,
  TreeChildren,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
@Tree('closure-table') // Usaremos closure-table para la relación de árbol/jerarquía
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true, nullable: false })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string | null;

  @TreeParent()
  parent: Category | null; // Permitir que el padre sea nulo para categorías raíz

  @TreeChildren()
  children: Category[];

  @ManyToMany(() => Product, (product) => product.categories)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: Product[];
}
