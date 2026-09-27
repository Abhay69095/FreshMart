import { db } from '../data/dbStore.js';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
  image: string;
  price: number;
  discountPrice?: number;
  unit: string; // '50 g' | '100 g' | '250 g' | '500 g' | '1 kg' | '2 kg' | '5 kg' | 'Per piece'
  stockQuantity: number;
  minOrderQuantity: number;
  isAvailable: boolean;
  freshness: string;
  isSeasonal?: boolean;
  isOrganic?: boolean;
  rating?: number;
  reviewsCount?: number;
  vendorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ProductModel = {
  find: (query?: (p: IProduct) => boolean) => db.find('products', query) as unknown as IProduct[],
  findOne: (query: (p: IProduct) => boolean) => db.findOne('products', query) as unknown as IProduct | null,
  findById: (id: string) => db.findById('products', id) as unknown as IProduct | null,
  create: (prodData: Partial<IProduct>) => db.insert('products', prodData) as unknown as IProduct,
  findByIdAndUpdate: (id: string, update: Partial<IProduct>) => db.findByIdAndUpdate('products', id, update) as unknown as IProduct | null,
  findByIdAndDelete: (id: string) => db.findByIdAndDelete('products', id)
};
