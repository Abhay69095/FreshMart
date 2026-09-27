import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((res) => {
        if (res.success && res.products) {
          const filtered = res.products.filter((p) => wishlist.includes(p._id));
          setProducts(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wishlist]);

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product._id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
          My Saved Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Products you love and want to order for upcoming recipes.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-neutral-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Save seasonal mangoes, crisp greens, or sweet apples to your wishlist for quick weekly re-ordering!
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Explore Fresh Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const displayPrice = product.discountPrice || product.price;
            return (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-neutral-100 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 text-rose-600 rounded-full hover:bg-white shadow-xs"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-1">
                    <p className="text-[11px] text-emerald-700 font-semibold">{product.category}</p>
                    <Link to={`/products/${product._id}`} className="font-semibold text-sm text-neutral-900 line-clamp-1 hover:text-emerald-700">
                      {product.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      ₹{displayPrice} / {product.unit}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
