import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { OrderModel, IOrder, IOrderItem } from '../models/Order.js';
import { ProductModel } from '../models/Product.js';
import { StoreModel } from '../models/Store.js';

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please login to place an order.' });
      return;
    }

    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
      return;
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.house || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      res.status(400).json({ success: false, message: 'Please provide a complete delivery address with phone and pincode.' });
      return;
    }

    // Validate products and check stock
    const validatedItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = ProductModel.findById(item.productId);
      if (!product) {
        res.status(400).json({ success: false, message: `Product "${item.name || item.productId}" is no longer available.` });
        return;
      }

      if (!product.isAvailable || product.stockQuantity <= 0) {
        res.status(400).json({ success: false, message: `"${product.name}" is currently out of stock.` });
        return;
      }

      if (product.stockQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} ${product.unit} available for "${product.name}". Please reduce quantity in cart.`
        });
        return;
      }

      const unitPrice = product.discountPrice || product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: unitPrice,
        unit: product.unit,
        quantity: item.quantity,
        image: product.image,
        itemTotal
      });
    }

    // Delivery fee logic
    const store = StoreModel.findOne();
    const threshold = store?.freeDeliveryThreshold || 499;
    const standardFee = store?.deliveryFeeStandard || 40;
    const deliveryFee = subtotal >= threshold ? 0 : standardFee;

    // Optional promotional discount: orders >= 500 get 5% instant discount
    let discount = 0;
    if (subtotal >= 600) {
      discount = Math.round(subtotal * 0.05);
    }

    const totalAmount = subtotal + deliveryFee - discount;

    // Generate unique order ID FM2026 + 5 random digits
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `FM2026${randomSuffix}`;

    const now = new Date().toISOString();
    const initialStatus = 'Placed';

    // Deduct inventory
    for (const item of validatedItems) {
      const product = ProductModel.findById(item.productId);
      if (product) {
        const remainingStock = Math.max(0, product.stockQuantity - item.quantity);
        ProductModel.findByIdAndUpdate(product._id, {
          stockQuantity: remainingStock,
          isAvailable: remainingStock > 0
        });
      }
    }

    const newOrder: IOrder = OrderModel.create({
      _id: orderId,
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: deliveryAddress.phone,
      items: validatedItems,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: initialStatus,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      estimatedDelivery: 'Today within 90 minutes',
      statusHistory: [
        {
          status: 'Placed',
          timestamp: now,
          note: `Order placed via ${paymentMethod || 'Cash on Delivery'}. FreshMart vendor alerted.`
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const orders = OrderModel.find((o) => o.customerId === req.user?._id);
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your orders' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check authorization: if user is logged in as another customer who doesn't own this order
    if (req.user && req.user.role !== 'admin' && order.customerId && req.user._id !== order.customerId) {
      res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
      return;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = OrderModel.findById(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (req.user?.role !== 'admin' && order.customerId !== req.user?._id) {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
      return;
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}.` });
      return;
    }

    // Revert inventory stock
    for (const item of order.items) {
      const product = ProductModel.findById(item.productId);
      if (product) {
        ProductModel.findByIdAndUpdate(product._id, {
          stockQuantity: product.stockQuantity + item.quantity,
          isAvailable: true
        });
      }
    }

    const now = new Date().toISOString();
    const updatedHistory = [
      ...(order.statusHistory || []),
      {
        status: 'Cancelled' as const,
        timestamp: now,
        note: `Cancelled by ${req.user?.role === 'admin' ? 'Vendor/Admin' : 'Customer'}: ${reason || 'Customer requested cancellation'}`
      }
    ];

    const updated = OrderModel.findByIdAndUpdate(order._id, {
      orderStatus: 'Cancelled',
      paymentStatus: order.paymentStatus === 'Paid' ? 'Cancelled' : 'Cancelled',
      cancellationReason: reason || 'Cancelled by user',
      statusHistory: updatedHistory
    });

    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled and stock restored.',
      order: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};
