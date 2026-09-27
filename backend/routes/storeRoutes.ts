import { Router } from 'express';
import { getStoreProfile, updateStoreProfile } from '../controllers/storeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getStoreProfile);
router.put('/', authenticateToken as any, requireAdmin as any, updateStoreProfile as any);

export default router;
