import { db } from '../data/dbStore.js';

export type OrderStatus = 'Placed' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  itemTotal: number;
}

export interface IDeliveryAddress {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface IStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IOrderItem[];
  deliveryAddress: IDeliveryAddress;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  estimatedDelivery?: string;
  cancellationReason?: string;
  statusHistory: IStatusHistoryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export const OrderModel = {
  find: (query?: (o: IOrder) => boolean) => db.find('orders', query) as unknown as IOrder[],
  findOne: (query: (o: IOrder) => boolean) => db.findOne('orders', query) as unknown as IOrder | null,
  findById: (id: string) => db.findById('orders', id) as unknown as IOrder | null,
  create: (data: Partial<IOrder>) => db.insert('orders', data) as unknown as IOrder,
  findByIdAndUpdate: (id: string, update: Partial<IOrder>) => db.findByIdAndUpdate('orders', id, update) as unknown as IOrder | null,
  findByIdAndDelete: (id: string) => db.findByIdAndDelete('orders', id)
};
