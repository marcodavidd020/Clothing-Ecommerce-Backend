import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ModelRepository } from '../../common/repositories/model.repository';
import { OrderSerializer } from '../serializers/order.serializer';
// import { IOrderCreate, IOrderUpdate } from '../interfaces/order.interface'; // Comentado o eliminado
import {
  IPaginationOptions,
  IPaginatedResult,
} from 'src/common/interfaces/pagination.interface';

@Injectable()
export class OrdersRepository extends ModelRepository<Order, OrderSerializer> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(OrderSerializer);
    this.manager = dataSource.manager;
    this.repository = dataSource.getRepository(Order);
    this.metadata = this.repository.metadata;
  }

  private getDefaultRelations(): string[] {
    return [
      'user',
      'address',
      'payment',
      'coupon',
      'items',
      'items.productVariant',
      'items.productVariant.product', // Para poder mostrar info del producto en el item de la orden
    ];
  }

  async findById(id: string): Promise<OrderSerializer | null> {
    return this.get(id, this.getDefaultRelations());
  }

  async findRawByIdWithItems(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id },
      relations: this.getDefaultRelations(),
    });
  }

  async findByUserId(
    userId: string,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<OrderSerializer> | OrderSerializer[]> {
    const where: FindOptionsWhere<Order> = { user_id: userId };
    if (options && (options.page || options.limit)) {
      return this.paginateBy(where, options, this.getDefaultRelations());
    }
    return this.getAllBy(where, this.getDefaultRelations());
  }

  // No transformamos la orden aquí, el servicio lo hará después de calcular el total y otras lógicas
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.repository.create(orderData);
    return this.repository.save(order);
  }

  async updateOrder(
    id: string,
    updateData: Partial<Order>,
  ): Promise<Order | null> {
    await this.repository.update(id, updateData);
    return this.findRawByIdWithItems(id); // Devolver la entidad completa para el servicio
  }

  async updateOrderStatus(
    id: string,
    status: string,
    paymentStatus?: string,
  ): Promise<OrderSerializer | null> {
    const updatePayload: Partial<Order> = { status: status as any };
    if (paymentStatus) {
      updatePayload.paymentStatus = paymentStatus as any;
    }
    const result = await this.repository.update(id, updatePayload);
    if (result.affected === 0) {
      return null;
    }
    return this.findById(id);
  }

  async paginateOrders(
    options: IPaginationOptions,
    where?: FindOptionsWhere<Order>,
  ): Promise<IPaginatedResult<OrderSerializer>> {
    return this.paginate(options, this.getDefaultRelations(), where);
  }

  // Nuevo método para buscar un OrderItem por su ID
  async findOrderItemById(orderItemId: string): Promise<OrderItem | null> {
    const orderItemRepository = this.manager.getRepository(OrderItem);
    return orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: ['productVariant', 'productVariant.product'], // Cargar relaciones necesarias para la reseña
    });
  }
}
