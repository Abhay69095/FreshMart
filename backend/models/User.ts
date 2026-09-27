import { db } from '../data/dbStore.js';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: {
    house?: string;
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const UserModel = {
  find: (query?: (u: IUser) => boolean) => db.find('users', query) as unknown as IUser[],
  findOne: (query: (u: IUser) => boolean) => db.findOne('users', query) as unknown as IUser | null,
  findById: (id: string) => db.findById('users', id) as unknown as IUser | null,
  create: (userData: Partial<IUser>) => db.insert('users', userData) as unknown as IUser,
  findByIdAndUpdate: (id: string, update: Partial<IUser>) => db.findByIdAndUpdate('users', id, update) as unknown as IUser | null,
  findByIdAndDelete: (id: string) => db.findByIdAndDelete('users', id)
};
