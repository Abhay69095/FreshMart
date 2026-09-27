import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  itemCount: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('freshmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('freshmart_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Could not save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1): boolean => {
    if (!product.isAvailable || product.stockQuantity <= 0) {
      showToast(`${product.name} is currently out of stock.`, 'error');
      return false;
    }

    const existingIndex = items.findIndex((i) => i.productId === product._id);
    const currentQtyInCart = existingIndex > -1 ? items[existingIndex].quantity : 0;
    const requestedTotal = currentQtyInCart + quantity;

    if (requestedTotal > product.stockQuantity) {
      showToast(`Only ${product.stockQuantity} ${product.unit} available in stock.`, 'error');
      return false;
    }

    const unitPrice = product.discountPrice || product.price;

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity = requestedTotal;
      updated[existingIndex].stockQuantity = product.stockQuantity;
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: unitPrice,
          unit: product.unit,
          quantity,
          image: product.image,
          stockQuantity: product.stockQuantity
        }
      ]);
    }

    showToast(`Added ${quantity} ${product.unit} of ${product.name} to cart.`, 'success');
    return true;
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const item = items.find((i) => i.productId === productId);
    if (!item) return false;

    if (quantity > item.stockQuantity) {
      showToast(`Maximum available stock is ${item.stockQuantity} ${item.unit}.`, 'error');
      return false;
    }

    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
    return true;
  };

  const removeFromCart = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    if (item) {
      showToast(`Removed ${item.name} from cart.`, 'info');
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  // 5% discount for orders >= 600
  const discount = subtotal >= 600 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + deliveryFee - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        discount,
        total,
        itemCount,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountNeededForFreeDelivery
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
