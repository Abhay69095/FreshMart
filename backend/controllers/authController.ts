import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../models/User.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = UserModel.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      phone: phone || '',
      address: address || {},
      wishlist: []
    });

    const userProfile: Partial<IUser> = { ...newUser };
    delete userProfile.password;

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to FreshMart.',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = UserModel.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const userProfile: Partial<IUser> = { ...user };
    delete userProfile.password;

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userProfile: Partial<IUser> = { ...req.user };
    delete userProfile.password;

    res.status(200).json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, phone, address } = req.body;

    const updated = UserModel.findByIdAndUpdate(req.user._id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address })
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userProfile: Partial<IUser> = { ...updated };
    delete userProfile.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const toggleWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please login to manage your wishlist.' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID required.' });
      return;
    }

    const currentWishlist = req.user.wishlist || [];
    let updatedWishlist: string[];
    let action: 'added' | 'removed';

    if (currentWishlist.includes(productId)) {
      updatedWishlist = currentWishlist.filter((id) => id !== productId);
      action = 'removed';
    } else {
      updatedWishlist = [...currentWishlist, productId];
      action = 'added';
    }

    const updated = UserModel.findByIdAndUpdate(req.user._id, { wishlist: updatedWishlist });

    res.status(200).json({
      success: true,
      action,
      message: action === 'added' ? 'Added to your wishlist' : 'Removed from your wishlist',
      wishlist: updated?.wishlist || updatedWishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    return;
  }

  const user = UserModel.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // For security reasons, don't disclose whether email exists
    res.status(200).json({
      success: true,
      message: 'If this email is registered with FreshMart, a password reset link has been dispatched.'
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: `Password reset instructions sent to ${email}. (Demo link: Use 'admin123' or 'customer123' to login).`
  });
};
