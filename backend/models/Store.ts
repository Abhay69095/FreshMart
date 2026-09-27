import { db } from '../data/dbStore.js';

export interface IStore {
  _id: string;
  storeName: string;
  vendorName: string;
  location: string;
  fullAddress: string;
  phone: string;
  supportEmail: string;
  openingHours: string;
  deliveryRadiusKm: number;
  deliveryFeeStandard: number;
  freeDeliveryThreshold: number;
  aboutVendor: string;
  bannerImage?: string;
  rating?: number;
  totalOrdersFulfilled?: number;
  isAcceptingOrders: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const StoreModel = {
  find: (query?: (s: IStore) => boolean) => db.find('stores', query) as unknown as IStore[],
  findOne: (query?: (s: IStore) => boolean) => {
    const list = db.find('stores', query || (() => true)) as unknown as IStore[];
    return list.length > 0 ? list[0] : null;
  },
  findByIdAndUpdate: (id: string, update: Partial<IStore>) => db.findByIdAndUpdate('stores', id, update) as unknown as IStore | null,
};
