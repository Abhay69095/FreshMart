import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck, ShieldCheck, XCircle, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { OrderTimeline } from '../components/OrderTimeline';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrder = () => {
    if (!id) return;
    setLoading(true);
    api.getOrderById(id)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        }
      })
      .catch((err) => {
        console.error('Error fetching order:', err);
        showToast('Could not load order details.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      const res = await api.cancelOrder(id, cancelReason || 'Customer requested cancellation.');
      if (res.success && res.order) {
        setOrder(res.order);
        setCancelModalOpen(false);
        showToast('Order cancelled. Reserved products returned to stock.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-neutral-500 mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Order Not Found</h2>
        <Link to="/my-orders" className="text-xs text-emerald-700 underline font-semibold">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const isEligibleForCancellation = ['Placed', 'Confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {isEligibleForCancellation && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 font-mono">
                Order #{order._id}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString([], {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400 block">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Live Timeline */}
        <div className="py-2">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
            Live Order & Dispatch Timeline
          </h3>
          <OrderTimeline currentStatus={order.orderStatus} history={order.statusHistory} />
        </div>
      </div>

      {/* Details Grid: Address, Payment, Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Delivery Destination
          </h3>
          <p className="font-semibold text-neutral-900 pt-1">{order.deliveryAddress.fullName}</p>
          <p className="text-neutral-600">{order.deliveryAddress.phone}</p>
          <p className="text-neutral-600 leading-relaxed">
            {order.deliveryAddress.house}, {order.deliveryAddress.street}, {order.deliveryAddress.area ? `${order.deliveryAddress.area}, ` : ''}{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
          </p>
          {order.deliveryAddress.landmark && (
            <p className="text-neutral-500 italic">Landmark: {order.deliveryAddress.landmark}</p>
          )}
        </div>

        {/* Payment info */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-neutral-900 flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Payment & Dispatch Details
          </h3>
          <div className="space-y-1.5 pt-1 text-neutral-700">
            <p>Payment Method: <strong className="text-neutral-900">{order.paymentMethod}</strong></p>
            <p>Payment Status: <span className="font-semibold text-emerald-700">{order.paymentStatus}</span></p>
            <p>Estimated Delivery: <strong>{order.estimatedDelivery || 'Within 90 mins'}</strong></p>
            <p className="text-neutral-500 pt-1">Vendor: Ramesh Patel & Sons (APMC Market Yard, Palghar)</p>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900 font-display">
            Ordered Items ({order.items.length})
          </h3>
        </div>

        <div className="divide-y divide-neutral-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                />
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">{item.name}</h4>
                  <p className="text-neutral-500">
                    ₹{item.price} / {item.unit}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-neutral-700">Qty: {item.quantity}</p>
                <p className="font-mono font-bold text-neutral-900 tabular-nums text-sm mt-0.5">
                  ₹{item.itemTotal}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bill calculation footer */}
        <div className="bg-neutral-50 p-5 border-t border-neutral-200 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Delivery Charges</span>
            <span className="font-mono tabular-nums">
              {order.deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${order.deliveryFee}`}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-800">
              <span>Discount</span>
              <span className="font-mono tabular-nums">-₹{order.discount}</span>
            </div>
          )}
          <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
            <span>Total Paid / Payable</span>
            <span className="font-mono tabular-nums text-emerald-800 text-base">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Cancel Order #{order._id}?</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Are you sure you want to cancel this order? The products will be returned to the vendor's fresh inventory.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Ordered incorrect quantity, change of plans"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
