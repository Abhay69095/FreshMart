import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken as any, createOrder as any);
router.get('/my-orders', authenticateToken as any, getMyOrders as any);
router.get('/:id', optionalAuth as any, getOrderById as any);
router.put('/:id/cancel', authenticateToken as any, cancelOrder as any);

export default router;
