import { Request, Response } from 'express';
import { ProductModel, IProduct } from '../models/Product.js';
import { db } from '../data/dbStore.js';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      availability,
      discountOnly,
      isOrganic,
      isSeasonal,
      sortBy
    } = req.query;

    let products = ProductModel.find();

    // 1. Text Search (name, category, description)
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (category && typeof category === 'string' && category !== 'All') {
      const catLower = category.toLowerCase();
      products = products.filter((p) =>
        p.category.toLowerCase() === catLower ||
        (p.categoryId && p.categoryId.toLowerCase() === catLower)
      );
    }

    // 3. Price Range Filter
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) {
        products = products.filter((p) => {
          const effectivePrice = p.discountPrice || p.price;
          return effectivePrice >= min;
        });
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) {
        products = products.filter((p) => {
          const effectivePrice = p.discountPrice || p.price;
          return effectivePrice <= max;
        });
      }
    }

    // 4. Availability Filter
    if (availability === 'in_stock') {
      products = products.filter((p) => p.isAvailable && p.stockQuantity > 0);
    }

    // 5. Discount Only Filter
    if (discountOnly === 'true') {
      products = products.filter((p) => p.discountPrice && p.discountPrice < p.price);
    }

    // 6. Organic / Seasonal Filter
    if (isOrganic === 'true') {
      products = products.filter((p) => p.isOrganic);
    }
    if (isSeasonal === 'true') {
      products = products.filter((p) => p.isSeasonal);
    }

    // 7. Sorting
    if (sortBy === 'price_asc') {
      products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'newest') {
      products.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } else if (sortBy === 'popular') {
      products.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = ProductModel.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Fetch related products in the same category
    const related = ProductModel.find(
      (p) => p.category === product.category && p._id !== product._id
    ).slice(0, 4);

    // Fetch reviews
    const allReviews = db.getCollection('reviews');
    const reviews = allReviews.filter((r) => r.productId === product._id);

    res.status(200).json({
      success: true,
      product,
      related,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const fruits = ProductModel.find((p) => p.category === 'Fresh Fruits').slice(0, 4);
    const vegetables = ProductModel.find((p) => p.category === 'Fresh Vegetables').slice(0, 4);
    const bestDeals = ProductModel.find((p) => Boolean(p.discountPrice && p.discountPrice < p.price)).slice(0, 4);
    const seasonal = ProductModel.find((p) => Boolean(p.isSeasonal)).slice(0, 4);

    res.status(200).json({
      success: true,
      fruits,
      vegetables,
      bestDeals,
      seasonal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};
