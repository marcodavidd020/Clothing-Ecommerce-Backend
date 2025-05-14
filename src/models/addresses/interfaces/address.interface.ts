import { User } from '../../users/entities/user.entity';

export interface IAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddressCreate {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  userId: string;
}

export interface IAddressUpdate {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
