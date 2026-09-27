import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category.js';
import { ProductModel } from '../models/Product.js';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = CategoryModel.find();
    // Dynamically calculate product count per category
    const products = ProductModel.find();
    const categoriesWithCount = categories.map((cat) => {
      const count = products.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase() || p.categoryId === cat._id
      ).length;
      return {
        ...cat,
        itemCount: count
      };
    });

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = CategoryModel.findOne((c) => c.slug === slug || c._id === slug);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const products = ProductModel.find(
      (p) => p.category.toLowerCase() === category.name.toLowerCase() || p.categoryId === category._id
    );

    res.status(200).json({
      success: true,
      category,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch category details' });
  }
};
