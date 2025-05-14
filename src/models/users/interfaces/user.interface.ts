import { Address } from '../../addresses/entities/address.entity';

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  isActive: boolean;
  avatar?: string;
  roles?: string[];
  addresses?: Address[];
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  avatar?: string;
  password?: string;
}
