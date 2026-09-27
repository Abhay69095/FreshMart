import { Product, Category, User, Order, StoreInfo } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('freshmart_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({ message: 'Invalid response from server' }));

  if (!response.ok) {
    if (response.status === 401) {
      // Clear expired token if unauthorized
      if (endpoint.includes('/auth/profile')) {
        localStorage.removeItem('freshmart_token');
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData: any) =>
    request<{ success: boolean; message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getProfile: () => request<{ success: boolean; user: User }>('/auth/profile'),

  updateProfile: (profileData: any) =>
    request<{ success: boolean; message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),

  toggleWishlist: (productId: string) =>
    request<{ success: boolean; action: 'added' | 'removed'; message: string; wishlist: string[] }>('/auth/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    }),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Products
  getProducts: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return request<{ success: boolean; count: number; products: Product[] }>(`/products${qs ? `?${qs}` : ''}`);
  },

  getFeaturedProducts: () =>
    request<{
      success: boolean;
      fruits: Product[];
      vegetables: Product[];
      bestDeals: Product[];
      seasonal: Product[];
    }>('/products/featured'),

  getProductById: (id: string) =>
    request<{ success: boolean; product: Product; related: Product[]; reviews: any[] }>(`/products/${id}`),

  // Categories
  getCategories: () => request<{ success: boolean; categories: Category[] }>('/categories'),

  getCategoryBySlug: (slug: string) =>
    request<{ success: boolean; category: Category; products: Product[] }>(`/categories/${slug}`),

  // Orders
  createOrder: (orderData: any) =>
    request<{ success: boolean; message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),

  getMyOrders: () => request<{ success: boolean; count: number; orders: Order[] }>('/orders/my-orders'),

  getOrderById: (id: string) => request<{ success: boolean; order: Order }>(`/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    request<{ success: boolean; message: string; order: Order }>(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  // Store
  getStore: () => request<{ success: boolean; store: StoreInfo }>('/store'),

  updateStore: (data: Partial<StoreInfo>) =>
    request<{ success: boolean; message: string; store: StoreInfo }>('/store', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Admin
  getAdminDashboard: () =>
    request<{
      success: boolean;
      stats: {
        totalSales: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        pendingOrdersCount: number;
      };
      salesTrend: { day: string; sales: number; orders: number }[];
      topSellingProducts: { name: string; quantity: number; revenue: number; image: string }[];
      categorySales: { name: string; amount: number }[];
      recentOrders: Order[];
    }>('/admin/dashboard'),

  getAdminProducts: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return request<{ success: boolean; count: number; products: Product[] }>(`/admin/products${qs ? `?${qs}` : ''}`);
  },

  createProduct: (data: Partial<Product>) =>
    request<{ success: boolean; message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<{ success: boolean; message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/products/${id}`, {
      method: 'DELETE'
    }),

  restockProduct: (id: string, amount: number) =>
    request<{ success: boolean; message: string; product: Product }>(`/admin/products/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  getAdminOrders: (params: { status?: string; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request<{ success: boolean; count: number; orders: Order[] }>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (id: string, orderStatus: string, note?: string) =>
    request<{ success: boolean; message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus, note })
    }),

  getAdminCustomers: () =>
    request<{ success: boolean; count: number; customers: any[] }>('/admin/customers'),

  createCategory: (data: Partial<Category>) =>
    request<{ success: boolean; message: string; category: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCategory: (id: string, data: Partial<Category>) =>
    request<{ success: boolean; message: string; category: Category }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCategory: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE'
    }),

  getDatabaseStatus: () =>
    request<{
      success: boolean;
      data: {
        mongoConfigured: boolean;
        mongoConnected: boolean;
        errorType: 'AUTH_FAILED' | 'IP_NOT_WHITELISTED' | 'OTHER' | null;
        lastError: string | null;
        username: string;
        localCounts: Record<string, number>;
        mongoCounts: Record<string, number>;
        instructions: string;
      };
    }>('/admin/database-status'),

  syncMongoDB: () =>
    request<{ success: boolean; message: string; counts: Record<string, number> }>('/admin/sync-mongodb', {
      method: 'POST'
    }),

  // Multi-turn Gemini AI Shopping & Recipe Assistant
  sendChatMessage: (data: {
    message: string;
    history: Array<{ role: 'user' | 'model'; text: string }>;
    mode?: 'general' | 'fast' | 'complex';
  }) =>
    request<{
      success: boolean;
      data: {
        role: 'model';
        reply: string;
        modelUsed: string;
        timestamp: string;
      };
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    })
};
