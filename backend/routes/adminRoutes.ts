import { Router } from 'express';
import {
  getDashboardStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  quickRestock,
  createCategory,
  updateCategory,
  deleteCategory,
  getDatabaseStatus,
  triggerMongoSync
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/dashboard', getDashboardStats as any);

// Database status & MongoDB Cloud Sync
router.get('/database-status', getDatabaseStatus as any);
router.post('/sync-mongodb', triggerMongoSync as any);

// Products
router.get('/products', getAdminProducts as any);
router.post('/products', createProduct as any);
router.put('/products/:id', updateProduct as any);
router.delete('/products/:id', deleteProduct as any);
router.post('/products/:id/restock', quickRestock as any);

// Orders
router.get('/orders', getAdminOrders as any);
router.put('/orders/:id/status', updateOrderStatus as any);

// Customers
router.get('/customers', getAdminCustomers as any);

// Categories
router.post('/categories', createCategory as any);
router.put('/categories/:id', updateCategory as any);
router.delete('/categories/:id', deleteCategory as any);

export default router;
