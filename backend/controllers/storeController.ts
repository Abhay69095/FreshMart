import { Request, Response } from 'express';
import { StoreModel } from '../models/Store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getStoreProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const store = StoreModel.findOne();
    res.status(200).json({
      success: true,
      store
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch store details' });
  }
};

export const updateStoreProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = StoreModel.findOne();
    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    const updated = StoreModel.findByIdAndUpdate(store._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Store profile updated successfully',
      store: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update store details' });
  }
};
