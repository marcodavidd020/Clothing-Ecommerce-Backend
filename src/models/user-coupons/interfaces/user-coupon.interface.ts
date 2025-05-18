export interface IUserCoupon {
  id: string;
  userId: string;
  couponId: string;
  usedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCouponCreate {
  userId: string;
  couponId: string;
  usedAt?: Date | null; // Opcional al crear, se puede marcar como usado después
  isActive?: boolean;
}

export interface IUserCouponUpdate {
  usedAt?: Date | null;
  isActive?: boolean;
}

export interface IMarkUserCouponAsUsedDto {
    // No necesita campos si la lógica está en el servicio y usa el ID de la URL
    // Opcionalmente, podría llevar la fecha si se permite especificarla externamente.
    // usedAt?: Date;
} 