import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ProductModel, IProduct } from '../models/Product.js';
import { OrderModel, OrderStatus } from '../models/Order.js';
import { UserModel } from '../models/User.js';
import { CategoryModel } from '../models/Category.js';
import { db } from '../data/dbStore.js';
import {
  isMongoConnected,
  forcePushLocalToMongoDB,
  MongoModels,
  getLastError,
  getLastErrorType,
  getMongoDbUsername
} from '../data/mongoBridge.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = OrderModel.find();
    const products = ProductModel.find();
    const customers = UserModel.find((u) => u.role === 'customer');

    // Total sales from completed or active orders (exclude cancelled)
    const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;

    const lowStockCount = products.filter((p) => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
    const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
    const pendingOrdersCount = orders.filter((o) => ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.orderStatus)).length;

    // Sales and Orders by day (last 7 days)
    const daysMap: Record<string, { sales: number; count: number }> = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
      daysMap[key] = { sales: 0, count: 0 };
    }

    orders.forEach((o) => {
      if (o.orderStatus === 'Cancelled') return;
      const orderDate = new Date(o.createdAt || Date.now());
      const key = `${dayNames[orderDate.getDay()]} (${orderDate.getDate()}/${orderDate.getMonth() + 1})`;
      if (daysMap[key]) {
        daysMap[key].sales += o.totalAmount || 0;
        daysMap[key].count += 1;
      }
    });

    const salesTrend = Object.keys(daysMap).map((day) => ({
      day,
      sales: daysMap[day].sales,
      orders: daysMap[day].count
    }));

    // Top selling products
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number; image: string }> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.itemTotal;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Category Sales breakdown
    const categorySalesMap: Record<string, number> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p._id === item.productId);
        const cat = prod?.category || 'Other';
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.itemTotal;
      });
    });

    const categorySales = Object.keys(categorySalesMap).map((name) => ({
      name,
      amount: categorySalesMap[name]
    })).sort((a, b) => b.amount - a.amount);

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        pendingOrdersCount
      },
      salesTrend,
      topSellingProducts,
      categorySales,
      recentOrders: orders.slice(0, 6)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, category, stockStatus } = req.query;
    let products = ProductModel.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (stockStatus === 'low') {
      products = products.filter((p) => p.stockQuantity <= 10 && p.stockQuantity > 0);
    } else if (stockStatus === 'out') {
      products = products.filter((p) => p.stockQuantity === 0);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products for admin' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      unit,
      stockQuantity,
      minOrderQuantity,
      image,
      freshness,
      isSeasonal,
      isOrganic
    } = req.body;

    if (!name || !category || price === undefined || stockQuantity === undefined) {
      res.status(400).json({ success: false, message: 'Please provide name, category, price, and stock quantity.' });
      return;
    }

    const newProduct: IProduct = ProductModel.create({
      name,
      description: description || 'Fresh farm-harvested products supplied directly by local farmers.',
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      unit: unit || '1 kg',
      stockQuantity: Number(stockQuantity),
      minOrderQuantity: Number(minOrderQuantity) || 1,
      image: image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
      freshness: freshness || 'Fresh Today',
      isAvailable: Number(stockQuantity) > 0,
      isSeasonal: Boolean(isSeasonal),
      isOrganic: Boolean(isOrganic),
      rating: 5.0,
      reviewsCount: 1,
      vendorId: req.user?._id
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.stockQuantity !== undefined) {
      updates.stockQuantity = Number(updates.stockQuantity);
      if (updates.isAvailable === undefined) {
        updates.isAvailable = updates.stockQuantity > 0;
      }
    }
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) updates.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : undefined;

    const updated = ProductModel.findByIdAndUpdate(id, updates);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      product: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = ProductModel.findByIdAndDelete(id);

    if (!success) {
      res.status(404).json({ success: false, message: 'Product not found or already deleted' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from catalog.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const getAdminOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    let orders = OrderModel.find();

    if (status && typeof status === 'string' && status !== 'All') {
      orders = orders.filter((o) => o.orderStatus.toLowerCase() === status.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      orders = orders.filter((o) =>
        o._id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }

    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin orders' });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { orderStatus, note } = req.body;

    const validStatuses: OrderStatus[] = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = OrderModel.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // If changing to Cancelled, revert product stock if not already cancelled
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        const prod = ProductModel.findById(item.productId);
        if (prod) {
          ProductModel.findByIdAndUpdate(prod._id, {
            stockQuantity: prod.stockQuantity + item.quantity,
            isAvailable: true
          });
        }
      }
    }

    const now = new Date().toISOString();
    const updatedHistory = [
      ...(order.statusHistory || []),
      {
        status: orderStatus,
        timestamp: now,
        note: note || `Status updated to ${orderStatus} by vendor.`
      }
    ];

    const updated = OrderModel.findByIdAndUpdate(id, {
      orderStatus,
      statusHistory: updatedHistory,
      ...(orderStatus === 'Delivered' ? { paymentStatus: 'Paid' } : {})
    });

    res.status(200).json({
      success: true,
      message: `Order ${id} status updated to ${orderStatus}.`,
      order: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

export const getAdminCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const customers = UserModel.find((u) => u.role === 'customer');
    const orders = OrderModel.find();

    const customerList = customers.map((c) => {
      const userOrders = orders.filter((o) => o.customerId === c._id);
      const totalSpent = userOrders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        _id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone || 'N/A',
        address: c.address,
        orderCount: userOrders.length,
        totalSpent,
        createdAt: c.createdAt || new Date().toISOString()
      };
    });

    customerList.sort((a, b) => b.totalSpent - a.totalSpent);

    res.status(200).json({
      success: true,
      count: customerList.length,
      customers: customerList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer list' });
  }
};

export const quickRestock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const addQty = Number(amount) || 20;

    const product = ProductModel.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const newStock = product.stockQuantity + addQty;
    const updated = ProductModel.findByIdAndUpdate(id, {
      stockQuantity: newStock,
      isAvailable: true
    });

    res.status(200).json({
      success: true,
      message: `Added +${addQty} ${product.unit} to ${product.name}. Current stock: ${newStock}`,
      product: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to restock product' });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, image } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = CategoryModel.findOne((c) => c.slug === slug);
    if (existing) {
      res.status(400).json({ success: false, message: 'Category already exists' });
      return;
    }

    const newCat = CategoryModel.create({
      name,
      slug,
      description: description || 'Fresh product category',
      icon: icon || 'Apple',
      image: image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
      itemCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = CategoryModel.findByIdAndUpdate(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = CategoryModel.findByIdAndDelete(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

export const getDatabaseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const mongoConnected = isMongoConnected();
    const hasMongoUri = !!process.env.MONGODB_URI;
    const errType = getLastErrorType();
    const lastErr = getLastError();
    const username = getMongoDbUsername();

    const collections = ['products', 'categories', 'orders', 'users', 'stores'] as const;
    const localCounts: Record<string, number> = {};
    const mongoCounts: Record<string, number> = {};

    for (const coll of collections) {
      localCounts[coll] = db.getCollection(coll).length;
      if (mongoConnected && (MongoModels as any)[coll]) {
        try {
          mongoCounts[coll] = await (MongoModels as any)[coll].countDocuments();
        } catch {
          mongoCounts[coll] = 0;
        }
      }
    }

    let instructions = 'MongoDB Atlas is active and synchronized in real-time with local replica.';
    if (!mongoConnected) {
      if (errType === 'AUTH_FAILED') {
        instructions = `MongoDB Authentication Failed: The user "${username}" was rejected by MongoDB Atlas. In Atlas, click "Database Access" under Security, verify this username exists, or click "Edit" to reset the password to match your URI.`;
      } else if (errType === 'IP_NOT_WHITELISTED') {
        instructions = 'To enable direct write to MongoDB Atlas: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).';
      } else {
        instructions = 'MongoDB Atlas is currently unreachable. The app is running smoothly using the persistent local document store.';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        mongoConfigured: hasMongoUri,
        mongoConnected,
        errorType: errType,
        lastError: lastErr,
        username,
        localCounts,
        mongoCounts,
        instructions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to check database status' });
  }
};

export const triggerMongoSync = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const result = await forcePushLocalToMongoDB();
    if (!result.success) {
      res.status(400).json({ success: false, message: result.message });
      return;
    }
    res.status(200).json({
      success: true,
      message: result.message,
      counts: result.counts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to sync with MongoDB' });
  }
};
