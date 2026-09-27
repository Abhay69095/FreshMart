import { db } from '../data/dbStore.js';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  itemCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const CategoryModel = {
  find: (query?: (c: ICategory) => boolean) => db.find('categories', query) as unknown as ICategory[],
  findOne: (query: (c: ICategory) => boolean) => db.findOne('categories', query) as unknown as ICategory | null,
  findById: (id: string) => db.findById('categories', id) as unknown as ICategory | null,
  create: (data: Partial<ICategory>) => db.insert('categories', data) as unknown as ICategory,
  findByIdAndUpdate: (id: string, update: Partial<ICategory>) => db.findByIdAndUpdate('categories', id, update) as unknown as ICategory | null,
  findByIdAndDelete: (id: string) => db.findByIdAndDelete('categories', id)
};
