import { User } from '../../users/entities/user.entity';

export interface IAddress {
  id: string;
  street: string;
  city: string;
  department: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isActive: boolean;
  fullName: string;
  phoneNumber: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddressCreate {
  street: string;
  city: string;
  department: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  fullName: string;
  phoneNumber: string;
  isDefault?: boolean;
  userId: string;
}

export interface IAddressUpdate {
  street?: string;
  city?: string;
  department?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  fullName?: string;
  phoneNumber?: string;
}
