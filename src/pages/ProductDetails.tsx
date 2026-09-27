import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Plus, Minus, ArrowLeft, Star, ShieldCheck, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);

  const { addToCart, items, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProductById(id)
      .then((res) => {
        if (res.success && res.product) {
          setProduct(res.product);
          setRelated(res.related || []);
          setReviews(res.reviews || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-neutral-500 mt-3">Loading fresh product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-xs text-neutral-500">The product item you requested does not exist or has been removed.</p>
        <Link to="/products" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const cartItem = items.find((i) => i.productId === product._id);

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
    : 0;

  const isOutOfStock = !product.isAvailable || product.stockQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>
      </div>

      {/* Main PDP Grid: Gallery Left, Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 relative">
            {!imageError ? (
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-800">
                <span className="text-5xl font-bold font-display">{product.name.charAt(0)}</span>
                <span className="text-sm font-semibold mt-2">{product.name}</span>
              </div>
            )}

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white font-bold text-xs uppercase px-2.5 py-1 rounded shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Value markers under gallery */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-neutral-900">{product.freshness}</p>
              <p className="text-[11px] text-neutral-500">Harvest guarantee</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <Truck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-neutral-900">90 Mins Delivery</p>
              <p className="text-[11px] text-neutral-500">Palghar area</p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-neutral-900">Inspect & Pay</p>
              <p className="text-[11px] text-neutral-500">Cash on delivery</p>
            </div>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          <div>
            {/* Metadata line */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <span className="text-emerald-700 font-semibold">{product.category}</span>
              <span>·</span>
              <span>Unit: {product.unit}</span>
              {product.isOrganic && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium">Certified Organic</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                {product.rating || 4.8}
              </span>
              <span className="text-xs text-neutral-400">
                ({product.reviewsCount || 24} customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
                  ₹{displayPrice}
                </span>
                <span className="text-sm text-neutral-500">
                  / {product.unit}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through font-mono tabular-nums">
                    ₹{product.price}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Inclusive of all local mandi charges & taxes</p>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="inline-block text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  In Stock ({product.stockQuantity} {product.unit} available)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Product Overview
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Purchase Controls */}
          {!isOutOfStock ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-neutral-300 rounded-lg p-1 bg-neutral-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded bg-white text-neutral-700 hover:bg-neutral-100 flex items-center justify-center disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="w-8 h-8 rounded bg-white text-neutral-700 hover:bg-neutral-100 flex items-center justify-center disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} {product.unit} to Cart</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                  }`}
                  title={isWishlisted ? 'In wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {cartItem && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span>Currently {cartItem.quantity} {product.unit} in your cart.</span>
                  <Link to="/cart" className="font-bold underline">View Cart</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-neutral-100 text-neutral-500 text-center rounded-lg text-xs font-semibold">
              This product item is currently sold out. Fresh stock arrives tomorrow morning at 7:00 AM.
            </div>
          )}

          {/* Vendor Trust Badge */}
          <div className="pt-4 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-500">
            <p className="text-neutral-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Local Vendor: Ramesh Patel & Sons
            </p>
            <p>Shop 4, APMC Wholesale Market Yard, Palghar (West)</p>
            <p className="text-emerald-700 font-medium">Daily freshness certified with digital electronic weighing</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 font-display">
          Customer Reviews & Experience ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-neutral-900">{rev.userName}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 italic">
            No specific reviews yet for this product. Fresh batches are rated 4.9/5 overall!
          </p>
        )}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-neutral-900 font-display">
            Similar Products You Might Need
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
