import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Cart: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    amountNeededForFreeDelivery,
    freeDeliveryThreshold
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 font-display">Your Basket is Empty</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Your basket doesn't have any farm fruits or vegetables yet. Explore our morning harvest and get nutritious meals started!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm"
        >
          <span>Explore Fresh Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
          Your Shopping Basket
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Review your items, adjust weights, and proceed to swift 90-minute neighborhood checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free delivery tracker */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {amountNeededForFreeDelivery > 0
                  ? `Add ₹${amountNeededForFreeDelivery} more for FREE Doorstep Delivery!`
                  : '🎉 Congratulations! You have unlocked FREE Doorstep Delivery!'}
              </span>
              <span className="font-mono text-emerald-800 tabular-nums">{freeDeliveryPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 shadow-xs overflow-hidden">
            {items.map((item) => (
              <div key={item.productId} className="p-4 sm:p-5 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-semibold text-neutral-900 hover:text-emerald-700 transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ₹{item.price} / {item.unit}
                  </p>
                  <p className="text-xs font-bold text-neutral-900 font-mono mt-1 tabular-nums">
                    ₹{item.price * item.quantity} total
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-neutral-300 rounded-lg p-0.5 bg-neutral-50 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-white text-neutral-700 hover:bg-neutral-100"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs font-mono tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stockQuantity}
                    className="w-7 h-7 flex items-center justify-center rounded bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-neutral-400 hover:text-rose-600 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-neutral-500 pt-2">
            <Link to="/products" className="hover:text-emerald-700 underline font-medium">
              ← Continue browsing fresh fruits & veggies
            </Link>
            <span>Standard delivery: 90 minutes within Palghar</span>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-neutral-900 font-display">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold tabular-nums text-neutral-900">
                ₹{subtotal}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Estimated Delivery Fee</span>
              <span className="font-mono font-semibold tabular-nums">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Promotional Discount (5%)</span>
                <span className="font-mono font-semibold tabular-nums">-₹{discount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm font-bold text-neutral-900">
              <span>Grand Total</span>
              <span className="text-xl font-mono tabular-nums text-emerald-800">
                ₹{total}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 space-y-1 text-[11px] text-neutral-500">
            <p className="font-semibold text-neutral-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Quality Inspected
            </p>
            <p>Every tomato and leaf is checked before packing. Pay safely with Cash on Delivery or UPI.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
