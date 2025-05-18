import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { IOrderItem, IOrderItemCreate } from './order-item.interface';
import { OrderStatusEnum } from '../constants/order.enums';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '../../payments/constants/payment.enums';

export interface IOrder {
  id: string;
  user_id: string | null;
  user?: User | null;
  address_id: string | null;
  address?: Address | null;
  payment_id: string | null;
  payment?: Payment | null;
  coupon_id: string | null;
  coupon?: Coupon | null;
  totalAmount: number;
  status: OrderStatusEnum;
  paymentStatus: PaymentStatusEnum | null;
  paymentMethod: PaymentMethodEnum | null;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreate {
  user_id: string; // ID del usuario que realiza la orden
  address_id: string; // ID de la dirección de envío seleccionada
  items: IOrderItemCreate[]; // Items que componen la orden
  payment_method: PaymentMethodEnum; // Método de pago elegido
  coupon_code?: string; // Código de cupón opcional a aplicar
  // totalAmount se calculará en el servicio
  // status y paymentStatus se establecerán inicialmente en el servicio
}

export interface IOrderUpdate {
  // Para actualizar el estado principalmente
  status?: OrderStatusEnum;
  payment_status?: PaymentStatusEnum;
  // Otros campos que un admin podría necesitar actualizar, como payment_id si se reintenta un pago manual
  payment_id?: string;
}
