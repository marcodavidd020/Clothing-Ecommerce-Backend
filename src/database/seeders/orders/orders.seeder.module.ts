import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersSeederService } from './orders.seeder.service';
import { Order } from '../../../models/orders/entities/order.entity';
import { OrderItem } from '../../../models/orders/entities/order-item.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Address } from '../../../models/addresses/entities/address.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';
import { Product } from '../../../models/products/entities/product.entity';
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { UserCoupon } from '../../../models/user-coupons/entities/user-coupon.entity'; // Necesario para marcar cupones como usados

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      User,
      Address,
      ProductVariant,
      Product, // Necesaria para acceder al precio del producto desde la variante
      Coupon,
      Payment,
      UserCoupon,
    ]),
  ],
  providers: [OrdersSeederService],
  exports: [OrdersSeederService],
})
export class OrdersSeederModule {}
