import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsSeederService } from './carts.seeder';
import { Cart } from '../../../models/carts/entities/cart.entity';
import { CartItem } from '../../../models/carts/entities/cart-item.entity';
import { User } from '../../../models/users/entities/user.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, ProductVariant])],
  providers: [CartsSeederService],
  exports: [CartsSeederService],
})
export class CartsSeederModule {}
