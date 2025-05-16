import { ProductVariant } from '../../products/entities/product-variant.entity'; // Asumiendo ruta

export interface ICartItem {
  id: string;
  productVariantId: string;
  productVariant?: ProductVariant; // Podría ser opcional si no siempre se carga
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart {
  id: string;
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
  // Podríamos añadir aquí métodos o propiedades calculadas si fuera necesario fuera de la entidad TypeORM
  // getTotal(): number;
}

// Interfaces para operaciones del servicio

export interface IAddCartItem {
  productVariantId: string;
  quantity: number;
}

export interface IUpdateCartItem {
  quantity: number;
}
