import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeParent,
  TreeChildren,
  Index,
} from 'typeorm';

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
}
