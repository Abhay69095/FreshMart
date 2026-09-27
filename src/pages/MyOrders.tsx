import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-orders');
      return;
    }

    api.getMyOrders()
      .then((res) => {
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-indigo-100 text-indigo-800';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
          My Product Orders
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          View your order history, live dispatch status, and receipts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">No Orders Placed Yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You haven't ordered any fresh vegetables or fruits yet. Start your healthy journey today!
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all space-y-4"
            >
              {/* Order header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-neutral-900">{order._id}</span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded ${getStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 shrink-0 bg-neutral-50 p-1.5 rounded-lg border border-neutral-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded object-cover"
                      />
                      <span className="text-xs text-neutral-700 font-medium">
                        {item.name} <strong className="text-neutral-900">×{item.quantity}</strong>
                      </span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-neutral-400 font-medium shrink-0">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Tracking & Receipt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
