import { ProductVariant } from '../../products/entities/product-variant.entity';

export interface IOrderItem {
  id: string;
  order_id: string;
  product_variant_id: string | null;
  productVariant?: ProductVariant | null;
  quantity: number;
  price: number; // Precio unitario en el momento de la compra
  createdAt: Date;
  updatedAt: Date;
  calculateSubtotal(): number;
}

export interface IOrderItemCreate {
  product_variant_id: string;
  quantity: number;
  price: number; // Este precio se debe fijar al crear, basado en el ProductVariant y descuentos aplicables
}

export interface IOrderItemUpdate {
  // Generalmente los items de una orden no se actualizan, se cancela y crea otra orden
  quantity?: number; // Podría ser útil para casos muy específicos, pero es raro
  price?: number;
}
