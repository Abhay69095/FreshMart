import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, RefreshCw, CheckCircle2, Truck, AlertCircle, X, Printer, Receipt } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Placed');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api.updateOrderStatus(selectedOrder._id, newStatus, statusNote);
      if (res.success) {
        showToast(`Order ${selectedOrder._id} marked as ${newStatus}!`, 'success');
        setStatusModalOpen(false);
        loadOrders();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

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
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            Order Fulfillment & Dispatch Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Update order stages to immediately notify customer on their tracking timeline.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing / Packing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-neutral-900 block">{order._id}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{order.customerPhone || order.customerEmail}</p>
                      <p className="text-[10px] text-neutral-400 truncate max-w-44">
                        {order.deliveryAddress.house}, {order.deliveryAddress.street}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-neutral-700">
                      <div className="space-y-0.5">
                        <span className="font-medium text-neutral-900">
                          {order.items.length} product types
                        </span>
                        <p className="text-[10px] text-neutral-500 truncate max-w-44">
                          {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 tabular-nums">
                      ₹{order.totalAmount}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-neutral-700 font-medium block">{order.paymentMethod}</span>
                      <span className={`text-[10px] font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/billing/print/${order._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded font-semibold text-xs transition-colors cursor-pointer"
                          title="Print Customer Bill / Tax Invoice (Full Page)"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Bill</span>
                        </Link>
                        <button
                          onClick={() => openStatusUpdate(order)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base font-display">
                Update Order #{selectedOrder._id}
              </h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="font-semibold text-neutral-800">Customer: {selectedOrder.customerName}</p>
                <p className="text-neutral-500">Phone: {selectedOrder.customerPhone || 'N/A'}</p>
                <p className="text-neutral-500">Address: {selectedOrder.deliveryAddress.house}, {selectedOrder.deliveryAddress.street}</p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Change Dispatch Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold"
                >
                  <option value="Placed">Placed (Received)</option>
                  <option value="Confirmed">Confirmed by Store</option>
                  <option value="Preparing">Preparing & Packing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Restores Stock)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Timeline Status Note (Visible to Customer)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Handpicked and weighed; Rider Santosh is on the way"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={`/admin/billing/print/${selectedOrder._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                  title="Open Full Page Bill"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Print Bill</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusModalOpen(false)}
                    className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    {updating ? 'Saving...' : 'Apply Status Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
