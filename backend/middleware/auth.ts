import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'freshmart_super_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
    const user = UserModel.findById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Token is invalid or expired.' });
    return;
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    return;
  }
  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
    const user = UserModel.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // If token is invalid or expired, continue as guest rather than hard failing
  }
  next();
};

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
