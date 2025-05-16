import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../../models/users/entities/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  // longitude
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ length: 100 })
  street: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ default: false })
  isDefault: boolean;

  //is Active
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
