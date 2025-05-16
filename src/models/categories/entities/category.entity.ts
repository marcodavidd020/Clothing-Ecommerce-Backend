import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';

@Entity('categories')
@Tree('closure-table') // Usaremos closure-table para la relación de árbol/jerarquía
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  slug: string;

  @TreeParent()
  parent: Category | null; // Permitir que el padre sea nulo para categorías raíz

  @TreeChildren()
  children: Category[];
}
