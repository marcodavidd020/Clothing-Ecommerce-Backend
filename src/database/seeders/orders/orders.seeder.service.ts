import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { Order } from '../../../models/orders/entities/order.entity';
import { OrderItem } from '../../../models/orders/entities/order-item.entity';
import { User } from '../../../models/users/entities/user.entity';
import { Address } from '../../../models/addresses/entities/address.entity';
import { ProductVariant } from '../../../models/products/entities/product-variant.entity';
import { Product } from '../../../models/products/entities/product.entity'; // Para acceder al precio original
import { Coupon } from '../../../models/coupons/entities/coupon.entity';
import { Payment } from '../../../models/payments/entities/payment.entity';
import { UserCoupon } from '../../../models/user-coupons/entities/user-coupon.entity';

import { OrderStatusEnum } from '../../../models/orders/constants/order.enums';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../../models/payments/constants/payment.enums';
import { CouponDiscountTypeEnum } from '../../../models/coupons/constants/coupon.enums';
import { Seeder } from '../seeder.interface';

@Injectable()
export class OrdersSeederService implements Seeder {
  private readonly logger = new Logger(OrdersSeederService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product) // Necesario para obtener info de producto si no viene en variante eager
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(UserCoupon)
    private readonly userCouponRepository: Repository<UserCoupon>,
  ) {}

  async run(dataSource: DataSource): Promise<void> {
    this.logger.log('Iniciando siembra de órdenes...');
    try {
      const orderCount = await this.orderRepository.count();
      const NUM_ORDERS_TO_CREATE = 5;
      if (orderCount >= NUM_ORDERS_TO_CREATE) {
        this.logger.log('Ya existen suficientes órdenes, saltando seeder...');
        return;
      }

      const users = await this.userRepository.find({ take: 5 });
      if (users.length === 0) {
        this.logger.warn('No hay usuarios para crear órdenes. Saltando...');
        return;
      }

      const allVariants = await this.productVariantRepository.find({
        relations: ['product'], // Cargar producto para acceder a su precio
        take: 20, // Tomar una buena cantidad para variedad
      });
      if (allVariants.length < 2) {
        // Necesitamos al menos 2 variantes para una orden de ejemplo
        this.logger.warn(
          'No hay suficientes variantes de producto para crear órdenes. Saltando...',
        );
        return;
      }

      const availableCoupons = await this.couponRepository.find({
        where: { isActive: true }, // Tomar cupones activos
      });

      for (let i = 0; i < NUM_ORDERS_TO_CREATE; i++) {
        const user = faker.helpers.arrayElement(users);
        const userAddresses = await this.addressRepository.find({
          where: { user: { id: user.id } },
        });
        if (userAddresses.length === 0) {
          this.logger.warn(
            `Usuario ${user.email} no tiene direcciones. Saltando orden para este usuario.`,
          );
          continue;
        }
        const address = faker.helpers.arrayElement(userAddresses);

        const newOrder = this.orderRepository.create();
        newOrder.user_id = user.id;
        newOrder.address_id = address.id;
        newOrder.paymentMethod = faker.helpers.arrayElement(
          Object.values(PaymentMethodEnum),
        );
        newOrder.status = OrderStatusEnum.PENDING_PAYMENT; // Estado inicial
        newOrder.paymentStatus = PaymentStatusEnum.PENDING;

        let orderSubtotal = 0;
        const orderItems: OrderItem[] = [];
        const numItemsInOrder = faker.number.int({ min: 1, max: 3 });
        const selectedVariants = faker.helpers.arrayElements(
          allVariants,
          numItemsInOrder,
        );

        for (const variant of selectedVariants) {
          if (!variant.product) {
            const product = await this.productRepository.findOneBy({
              id: variant.productId,
            });
            if (!product) {
              this.logger.warn(
                `Producto con ID ${variant.productId} no encontrado para variante ${variant.id}. Saltando item.`,
              );
              continue;
            }
            variant.product = product;
          }

          const itemPrice =
            variant.product.discountPrice ?? variant.product.price;
          const quantity = faker.number.int({ min: 1, max: 2 });

          const orderItem = this.orderItemRepository.create({
            product_variant_id: variant.id,
            quantity,
            price: itemPrice,
          });
          orderItems.push(orderItem);
          orderSubtotal += itemPrice * quantity;
        }

        if (orderItems.length === 0) {
          this.logger.warn(
            'No se pudieron crear items para la orden. Saltando orden.',
          );
          continue;
        }
        newOrder.items = orderItems;
        newOrder.totalAmount = parseFloat(orderSubtotal.toFixed(2));

        if (availableCoupons.length > 0 && Math.random() < 0.25) {
          const coupon = faker.helpers.arrayElement(availableCoupons);
          const couponDiscountValue = coupon.discountValue;
          const couponMinAmount = coupon.minAmount ?? 0;

          if (orderSubtotal >= couponMinAmount) {
            let discount = 0;
            if (coupon.discountType === CouponDiscountTypeEnum.FIXED_AMOUNT) {
              discount = couponDiscountValue;
            } else if (
              coupon.discountType === CouponDiscountTypeEnum.PERCENTAGE
            ) {
              discount = (orderSubtotal * couponDiscountValue) / 100;
            }
            newOrder.totalAmount = Math.max(
              0,
              parseFloat((orderSubtotal - discount).toFixed(2)),
            );
            newOrder.coupon_id = coupon.id;

            const userCoupon = this.userCouponRepository.create({
              userId: user.id,
              couponId: coupon.id,
              usedAt: new Date(),
              isActive: false,
            });
            await this.userCouponRepository.save(userCoupon);
          }
        }

        const payment = this.paymentRepository.create({
          provider: 'SystemSeeder',
          method: newOrder.paymentMethod,
          amount: newOrder.totalAmount,
          status: newOrder.paymentStatus,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        newOrder.payment_id = savedPayment.id;

        const savedOrder = await this.orderRepository.save(newOrder);
        for (const item of savedOrder.items) {
          item.order_id = savedOrder.id;
          await this.orderItemRepository.save(item);
        }

        this.logger.log(
          `Orden creada ID: ${savedOrder.id} para usuario ${user.email}, Total: ${savedOrder.totalAmount}`,
        );
      }

      this.logger.log(
        `Siembra de ${NUM_ORDERS_TO_CREATE} órdenes (o menos si hubo skips) completada.`,
      );
    } catch (error) {
      this.logger.error('Error durante la siembra de órdenes:', error.stack);
    }
  }
}
