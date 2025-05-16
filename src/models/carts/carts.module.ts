import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { CartsRepository } from './repositories/carts.repository';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { UsersModule } from '../users/users.module'; // Para acceder a UsersRepository
import { ProductsModule } from '../products/products.module'; // Para acceder a ProductVariantsRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    forwardRef(() => UsersModule), // forwardRef si hay dependencias circulares potenciales
    forwardRef(() => ProductsModule), // Asumiendo que ProductVariantsRepository se exporta desde ProductsModule
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository],
  exports: [CartsService, CartsRepository], // Exportar si otros módulos necesitan usar el servicio o repo de carritos
})
export class CartsModule {}
