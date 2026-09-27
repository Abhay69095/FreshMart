import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  const [imageError, setImageError] = useState(false);

  const cartItem = items.find((i) => i.productId === product._id);
  const isWishlisted = isInWishlist(product._id);

  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const displayPrice = product.discountPrice || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= 10;

  return (
    <div className="group bg-white rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          {!imageError ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 p-4 text-center">
              <span className="text-3xl font-bold font-display mb-1">{product.name.charAt(0)}</span>
              <span className="text-xs font-semibold">{product.name}</span>
            </div>
          )}
        </Link>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/90 text-neutral-500 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Discount banner tag if applicable */}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-neutral-900/90 px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed metadata line with typographic separator */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <span className="truncate max-w-28">{product.category}</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span className="text-emerald-700 font-medium">{product.freshness}</span>
          </div>

          <Link to={`/products/${product._id}`} className="block">
            <h3 className="font-semibold text-neutral-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="pt-3 mt-3 border-t border-neutral-100 flex flex-col gap-2.5">
          {/* Price & Unit */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-neutral-900 font-mono tabular-nums">
                ₹{displayPrice}
              </span>
              <span className="text-xs text-neutral-500 font-normal">
                / {product.unit}
              </span>
              {hasDiscount && (
                <span className="text-xs text-neutral-400 line-through font-mono tabular-nums">
                  ₹{product.price}
                </span>
              )}
            </div>

            {/* Low stock notice */}
            {isLowStock && (
              <span className="text-[11px] text-amber-700 font-medium">
                Only {product.stockQuantity} left
              </span>
            )}
          </div>

          {/* Cart action */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2 px-3 text-xs font-medium text-neutral-400 bg-neutral-100 rounded-lg cursor-not-allowed text-center"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs text-emerald-950 font-mono tabular-nums px-2">
                  {cartItem.quantity} in cart
                </span>
                <button
                  onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stockQuantity}
                  className="w-7 h-7 flex items-center justify-center rounded bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors duration-150"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
