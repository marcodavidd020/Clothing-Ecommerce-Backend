import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

export interface IReview {
  id: string;
  userId: string;
  user?: User; // Opcional, puede cargarse con la relación
  orderItemId: string;
  orderItem?: OrderItem; // Opcional, puede cargarse con la relación
  rating: number;
  comment: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewCreate {
  orderItemId: string;
  rating: number;
  comment?: string | null;
  // userId se tomará del usuario autenticado en el servicio
}

export interface IReviewUpdate {
  rating?: number;
  comment?: string | null;
  isActive?: boolean; // Para permitir desactivar/reactivar si es necesario por un admin
}
