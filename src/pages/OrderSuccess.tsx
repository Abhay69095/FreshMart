import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShoppingBag, Clock, MapPin, Truck } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { FreshMartLogo } from '../components/FreshMartLogo';

export const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      api.getOrderById(id)
        .then((res) => {
          if (res.success && res.order) setOrder(res.order);
        })
        .catch(console.error);
    }
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      {/* Success Badge */}
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
          Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-display">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-neutral-600 max-w-md mx-auto">
          Thank you for supporting your local vegetable and fruit vendor. Ramesh Patel's team has received your order and is packing it now.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs text-left space-y-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
          <FreshMartLogo size="sm" subtitle="Verified Order" />
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">
            Placed
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-neutral-100/60">
          <div>
            <p className="text-xs text-neutral-400">Order ID</p>
            <p className="text-base font-bold text-neutral-900 font-mono tabular-nums">{id}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-700">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Estimated Delivery: <strong>Today within 90 minutes</strong></span>
          </div>

          {order && (
            <>
              <div className="flex items-center gap-2 text-neutral-700">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Payment: <strong>{order.paymentMethod} (₹{order.totalAmount})</strong></span>
              </div>
              <div className="flex items-start gap-2 text-neutral-700 pt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Delivering to: {order.deliveryAddress.house}, {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          to={`/orders/${id}`}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <span>Track Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs sm:text-sm rounded-lg border border-neutral-300 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
