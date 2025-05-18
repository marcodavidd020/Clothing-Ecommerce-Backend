import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderSerializer } from './serializers/order.serializer';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { AddressesRepository } from '../addresses/repositories/addresses.repository';
import { ProductVariantsRepository } from '../products/repositories/product-variants.repository';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { CouponsRepository } from '../coupons/repositories/coupons.repository';
import { PaymentsService } from '../payments/payments.service'; // Para crear el registro de pago
import { UserCouponsRepository } from '../user-coupons/repositories/user-coupons.repository';
import { UserCoupon } from '../user-coupons/entities/user-coupon.entity';
import { OrderStatusEnum } from './constants/order.enums';
import {
  PaymentStatusEnum,
  PaymentMethodEnum,
} from '../payments/constants/payment.enums';
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';
import { CreatePaymentDto } from '../payments/dto/create-payment.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly productsService: ProductsService, // Para manejo de stock global del producto
    private readonly couponsRepository: CouponsRepository,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly userCouponsRepository: UserCouponsRepository,
  ) {}

  private async transformOrder(order: Order): Promise<OrderSerializer> {
    // Asegurar que las relaciones necesarias estén cargadas para el serializador
    const fullOrder = await this.ordersRepository.findRawByIdWithItems(
      order.id,
    );
    if (!fullOrder)
      throw new NotFoundException(
        'Orden no encontrada después de la operación.',
      );
    return new OrderSerializer(fullOrder);
  }

  async placeOrder(
    createOrderDto: CreateOrderDto,
    userIdAuth: string,
  ): Promise<OrderSerializer> {
    const { address_id, items, payment_method, coupon_code } = createOrderDto;
    const userIdToUse = createOrderDto.user_id || userIdAuth; // Prioriza user_id del DTO si es admin

    const user = await this.usersRepository.findById(userIdToUse);
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const address = await this.addressesRepository.findById(address_id);
    if (!address || address.user?.id !== userIdToUse) {
      throw new NotFoundException(
        'Dirección no encontrada o no pertenece al usuario.',
      );
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('La orden debe tener al menos un item.');
    }

    let orderTotalAmount = 0;
    const orderItemsEntities: OrderItem[] = [];

    // QueryRunner para transacciones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const itemDto of items) {
        const variantEntity = await this.productVariantsRepository.findRawById(
          itemDto.product_variant_id,
        );
        if (!variantEntity || !variantEntity.product) {
          throw new NotFoundException(
            `Variante de producto con ID ${itemDto.product_variant_id} no encontrada.`,
          );
        }
        if (variantEntity.stock < itemDto.quantity) {
          throw new ConflictException(
            `Stock insuficiente para la variante ${variantEntity.product.name} - ${variantEntity.color}/${variantEntity.size}. Disponible: ${variantEntity.stock}`,
          );
        }

        const itemPrice =
          variantEntity.product.discountPrice ?? variantEntity.product.price;

        const orderItem = new OrderItem();
        orderItem.product_variant_id = variantEntity.id;
        orderItem.productVariant = variantEntity;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = +itemPrice;
        orderItemsEntities.push(orderItem);
        orderTotalAmount += orderItem.calculateSubtotal();

        variantEntity.removeStock(itemDto.quantity);
        await queryRunner.manager.save(ProductVariant, variantEntity);

        await this.productsService.changeStockInternal(
          variantEntity.productId,
          -itemDto.quantity,
          queryRunner.manager,
        );
      }

      let finalAmount = orderTotalAmount;
      let appliedCoupon: Order['coupon'] = null;

      if (coupon_code) {
        const couponEntity =
          await this.couponsRepository.findRawByCode(coupon_code);
        if (!couponEntity) throw new NotFoundException('Cupón no encontrado.');

        if (!couponEntity.validate(orderTotalAmount)) {
          throw new BadRequestException(
            'El cupón no es válido, ha expirado o no cumple el monto mínimo.',
          );
        }
        // Validar usos del cupón
        if (couponEntity.maxUses !== null) {
          const totalTimesUsed =
            await this.userCouponsRepository.countTotalUsesByCouponId(
              couponEntity.id,
            );
          if (totalTimesUsed >= couponEntity.maxUses) {
            throw new BadRequestException(
              'Este cupón ha alcanzado su límite máximo de usos globales.',
            );
          }
        }

        const userCouponAssignment =
          await this.userCouponsRepository.findActiveUserCouponByCouponCodeForUser(
            userIdToUse,
            coupon_code,
          );
        if (userCouponAssignment && userCouponAssignment.usedAt) {
          throw new BadRequestException('Ya has utilizado este cupón.');
        }
        if (userCouponAssignment && !userCouponAssignment.usedAt) {
          // Marcar UserCoupon como usado si la asignación ya existe y no ha sido usado
          userCouponAssignment.markAsUsed();
          await queryRunner.manager.save(UserCoupon, userCouponAssignment);
        } else if (!userCouponAssignment && couponEntity.maxUses !== null) {
          // Si no hay una asignación específica y el cupón tiene un límite global, se crea una nueva entrada en UserCoupon
          const newUserCoupon = new UserCoupon();
          newUserCoupon.userId = userIdToUse;
          newUserCoupon.couponId = couponEntity.id;
          newUserCoupon.markAsUsed();
          await queryRunner.manager.save(UserCoupon, newUserCoupon);
        } else if (!userCouponAssignment && couponEntity.maxUses === null) {
          // Si no hay asignación y el cupón es de uso ilimitado (no requiere registro en UserCoupon per se, pero es buena práctica marcarlo)
          // Se podría decidir no crear UserCoupon aquí si el cupón no tiene maxUses y no se necesita rastrear por usuario.
          // Por consistencia, se puede crear igualmente.
          const newUserCoupon = new UserCoupon();
          newUserCoupon.userId = userIdToUse;
          newUserCoupon.couponId = couponEntity.id;
          newUserCoupon.markAsUsed();
          await queryRunner.manager.save(UserCoupon, newUserCoupon);
        }

        finalAmount = couponEntity.applyToOrder({
          totalAmount: orderTotalAmount,
        });
        appliedCoupon = couponEntity;
      }

      const order = new Order();
      order.user_id = userIdToUse;
      order.address_id = address_id;
      order.totalAmount = +finalAmount.toFixed(2);
      order.status = OrderStatusEnum.PENDING_PAYMENT;
      order.paymentMethod = payment_method;
      order.paymentStatus = PaymentStatusEnum.PENDING;
      order.coupon_id = appliedCoupon ? appliedCoupon.id : null;
      order.items = orderItemsEntities; // Se guardarán en cascada

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Crear el registro de pago asociado a la orden
      const paymentDto: CreatePaymentDto = {
        provider: 'System', // O un proveedor específico si se conoce, ej. 'Stripe'
        method: payment_method,
        amount: savedOrder.totalAmount,
        status: PaymentStatusEnum.PENDING, // El pago inicia como pendiente
        // Aquí podrías añadir una referencia a la orden, si tu entidad Payment la tiene
        // orderId: savedOrder.id,
      };
      const paymentRecord = await this.paymentsService.initiatePaymentInternal(
        paymentDto,
        queryRunner.manager,
      );
      savedOrder.payment_id = paymentRecord.id;
      savedOrder.payment = paymentRecord;
      await queryRunner.manager.save(Order, savedOrder);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Orden ${savedOrder.id} creada exitosamente para el usuario ${userIdToUse}.`,
      );
      return this.transformOrder(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al crear la orden para el usuario ${userIdToUse}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new ConflictException('Error al procesar la orden.');
    } finally {
      await queryRunner.release();
    }
  }

  async findOrderById(
    orderId: string,
    userId?: string,
  ): Promise<OrderSerializer> {
    const order = await this.ordersRepository.findRawByIdWithItems(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada.');
    if (userId && order.user_id !== userId) {
      throw new NotFoundException(
        'Orden no encontrada o no pertenece al usuario.',
      ); // O ForbiddenException
    }
    return this.transformOrder(order);
  }

  async findOrdersByUser(
    userId: string,
    paginationDto: IPaginationOptions,
  ): Promise<IPaginatedResult<OrderSerializer>> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return this.ordersRepository.findByUserId(userId, paginationDto) as Promise<
      IPaginatedResult<OrderSerializer>
    >;
  }

  async findAllOrders(
    paginationDto: IPaginationOptions,
  ): Promise<IPaginatedResult<OrderSerializer>> {
    return this.ordersRepository.paginateOrders(paginationDto);
  }

  async cancelOrder(
    orderId: string,
    userId?: string,
  ): Promise<OrderSerializer> {
    const order = await this.ordersRepository.findRawByIdWithItems(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada.');

    if (userId && order.user_id !== userId) {
      throw new NotFoundException(
        'Orden no encontrada o no pertenece al usuario.',
      );
    }

    // Lógica de cancelación: ¿Qué estados permiten cancelación?
    if (
      order.status === OrderStatusEnum.SHIPPED ||
      order.status === OrderStatusEnum.DELIVERED ||
      order.status === OrderStatusEnum.COMPLETED ||
      order.status === OrderStatusEnum.CANCELLED
    ) {
      throw new BadRequestException(
        `La orden en estado ${order.status} no puede ser cancelada.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.status = OrderStatusEnum.CANCELLED;
      // Si el pago ya se realizó, se debería gestionar un reembolso
      if (order.paymentStatus === PaymentStatusEnum.PAID && order.payment_id) {
        order.paymentStatus = PaymentStatusEnum.REFUNDED; // Marcar para reembolso
        // Aquí iría la lógica para iniciar el reembolso en el sistema de pagos
        await this.paymentsService.refundPaymentInternal(
          order.payment_id,
          queryRunner.manager,
        );
      } else if (
        order.paymentStatus === PaymentStatusEnum.PENDING &&
        order.payment_id
      ) {
        order.paymentStatus = PaymentStatusEnum.CANCELLED;
        await this.paymentsService.cancelPaymentInternal(
          order.payment_id,
          queryRunner.manager,
        );
      }

      // Reversión de stock
      for (const item of order.items) {
        if (item.product_variant_id) {
          const variantEntity = await this.productVariantsRepository.findRawById(
            item.product_variant_id,
          );
          if (variantEntity) {
            variantEntity.addStock(item.quantity);
            await queryRunner.manager.save(ProductVariant, variantEntity);
            await this.productsService.changeStockInternal(
              variantEntity.productId,
              item.quantity,
              queryRunner.manager,
            );
          }
        }
      }

      // Reversión de uso de cupón si es necesario (UserCoupon)
      if (order.coupon_id && order.user_id && order.coupon) {
        const userCoupon =
          await this.userCouponsRepository.findActiveUserCouponByCouponCodeForUser(
            order.user_id,
            order.coupon.code,
          );
        if (userCoupon && userCoupon.usedAt) {
          userCoupon.usedAt = null; // Revertir el uso
          await queryRunner.manager.save(UserCoupon, userCoupon);
        }
      }

      const updatedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      this.logger.log(`Orden ${orderId} cancelada.`);
      return this.transformOrder(updatedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al cancelar la orden ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new ConflictException('Error al cancelar la orden.');
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatusEnum,
    paymentTransactionId?: string,
  ): Promise<OrderSerializer> {
    const order = await this.ordersRepository.findRawByIdWithItems(orderId);
    if (!order) throw new NotFoundException('Orden no encontrada.');

    // Validaciones de transición de estado (ejemplo simple)
    // Se podría tener una matriz o lógica más compleja para esto
    if (
      order.status === OrderStatusEnum.COMPLETED ||
      order.status === OrderStatusEnum.CANCELLED
    ) {
      throw new BadRequestException(
        `La orden ya está en un estado final: ${order.status}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      order.status = newStatus;

      // Lógica adicional según el nuevo estado
      if (
        newStatus === OrderStatusEnum.PROCESSING &&
        order.paymentStatus !== PaymentStatusEnum.PAID
      ) {
        if (order.payment_id && paymentTransactionId) {
          await this.paymentsService.confirmPaymentInternal(
            order.payment_id,
            paymentTransactionId,
            queryRunner.manager,
          );
          order.paymentStatus = PaymentStatusEnum.PAID;
        } else {
          this.logger.warn(
            `Orden ${orderId} movida a PROCESSING sin confirmar pago.`,
          );
          // Podría ser un caso donde el pago se confirma externamente y solo se actualiza el estado de la orden
        }
      }
      // ... otras lógicas para SHIPPED, DELIVERED, COMPLETED ...
      if (
        newStatus === OrderStatusEnum.COMPLETED &&
        order.paymentStatus !== PaymentStatusEnum.PAID
      ) {
        this.logger.warn(
          `Orden ${orderId} marcada como COMPLETED pero el pago no está como PAID.`,
        );
      }

      const updatedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      this.logger.log(
        `Estado de la orden ${orderId} actualizado a ${newStatus}.`,
      );
      return this.transformOrder(updatedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al actualizar estado de orden ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new ConflictException('Error al actualizar el estado de la orden.');
    } finally {
      await queryRunner.release();
    }
  }

  // Implementación de getSummary (conceptual, el serializador ya da buena info)
  async getOrderSummary(orderId: string, userId?: string): Promise<any> {
    const order = await this.findOrderById(orderId, userId);
    // El OrderSerializer ya provee una buena estructura. Se puede añadir más aquí si es necesario.
    return {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      // Podrías añadir un resumen de items si quieres
      // itemsSummary: order.items.map(item => ({ name: item.productVariant?.product?.name, quantity: item.quantity, subtotal: item.subtotal }))
    };
  }
}
