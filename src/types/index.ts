export type OrderStatus = 'Placed' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface User {
  _id: string;
  name: string;
  email: string;
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
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  categoryId?: string;
  image: string;
  price: number;
  discountPrice?: number;
  unit: string;
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
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  itemCount?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
  stockQuantity: number;
}

export interface DeliveryAddress {
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

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    image: string;
    itemTotal: number;
  }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Online Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  estimatedDelivery?: string;
  cancellationReason?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
}

export interface StoreInfo {
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
}

export interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
