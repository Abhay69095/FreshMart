import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Calendar,
  ShoppingBag,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Order, StoreInfo } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PrintBillModal } from '../../components/PrintBillModal';

export const AdminBilling: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customerParam = searchParams.get('customer');
  const orderParam = searchParams.get('order');

  const [orders, setOrders] = useState<Order[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Print modal states
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerParam || 'All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, storeRes] = await Promise.all([
        api.getAdminOrders(),
        api.getStore().catch(() => ({ success: false, store: null }))
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.orders);

        // If an orderParam was specified in URL, automatically open its print modal
        if (orderParam) {
          const found = ordersRes.orders.find((o) => o._id === orderParam);
          if (found) {
            setSelectedOrderForPrint(found);
          }
        }
      }

      if (storeRes && storeRes.success && storeRes.store) {
        setStoreInfo(storeRes.store);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load billing records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected customer if URL parameter changes
  useEffect(() => {
    if (customerParam) {
      setSelectedCustomerId(customerParam);
    }
  }, [customerParam]);

  // Extract unique customers
  const uniqueCustomers = React.useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        phone?: string;
        address?: any;
        orderCount: number;
        totalSpent: number;
      }
    >();

    orders.forEach((o) => {
      const id = o.customerId || o.customerEmail;
      if (map.has(id)) {
        const current = map.get(id)!;
        current.orderCount += 1;
        current.totalSpent += o.totalAmount;
      } else {
        map.set(id, {
          id,
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          address: o.deliveryAddress,
          orderCount: 1,
          totalSpent: o.totalAmount
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filter orders based on criteria
  const filteredOrders = orders.filter((order) => {
    // 1. Particular Customer Filter
    if (selectedCustomerId !== 'All') {
      const custId = order.customerId || order.customerEmail;
      if (custId !== selectedCustomerId && order.customerName !== selectedCustomerId) {
        return false;
      }
    }

    // 2. Payment Status Filter
    if (paymentStatusFilter !== 'All') {
      if (paymentStatusFilter === 'Paid' && order.paymentStatus !== 'Paid') return false;
      if (paymentStatusFilter === 'Pending' && order.paymentStatus === 'Paid') return false;
    }

    // 3. Date Filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt).getTime();
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (dateFilter === 'today' && now - orderDate > oneDay) return false;
      if (dateFilter === 'week' && now - orderDate > 7 * oneDay) return false;
      if (dateFilter === 'month' && now - orderDate > 30 * oneDay) return false;
    }

    // 4. Text Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = order._id.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchPhone = order.customerPhone?.toLowerCase().includes(q) || false;
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchId && !matchName && !matchEmail && !matchPhone && !matchItem) return false;
    }

    return true;
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalBilled = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'Paid');
    const totalPaid = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = filteredOrders.filter((o) => o.paymentStatus !== 'Paid');
    const totalPending = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalCount: filteredOrders.length,
      totalBilled,
      totalPaid,
      totalPending,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length
    };
  }, [filteredOrders]);

  // Selected customer details (if a specific customer is picked)
  const currentParticularCustomer =
    selectedCustomerId !== 'All'
      ? uniqueCustomers.find((c) => c.id === selectedCustomerId || c.name === selectedCustomerId)
      : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 font-display">
              Customer Billing & Invoicing
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full">
              Standard A4 & Thermal 80mm PDF
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Generate and view official tax invoices and thermal receipts. Choose between Standard A4 or Thermal (80mm) to open bill PDFs directly in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentParticularCustomer && (
            <button
              type="button"
              onClick={() => setShowStatementModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Open format options to print statement for this customer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Customer Statement</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
            title="Reload Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Billing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Billed Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            ₹{stats.totalBilled.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Across {stats.totalCount} customer orders
          </p>
        </div>

        {/* Paid Amount */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Settled / Paid Bills</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            ₹{stats.totalPaid.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {stats.paidCount} cleared customer payments
          </p>
        </div>

        {/* Pending Cash on Delivery */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending COD Collection</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            ₹{stats.totalPending.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {stats.pendingCount} delivery collections due
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Billed Customers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {uniqueCustomers.length}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Local Palghar household accounts
          </p>
        </div>
      </div>

      {/* 3. Filter Bar: Customer Selector, Date & Payment Filters */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Customer Selector Dropdown */}
          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-bold text-neutral-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Particular Customer to Bill:</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Customers ({orders.length} total orders)</option>
              {uniqueCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.orderCount} orders · ₹{cust.totalSpent.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex-1 relative">
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Quick Search:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Bill #, Customer Name, Phone, or Product Item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div className="w-full md:w-44">
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Payment Status:
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Pending">Pending / COD</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-36">
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
              Date Period:
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Active Customer Detail Callout Banner */}
        {currentParticularCustomer && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {currentParticularCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">{currentParticularCustomer.name}</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                    Particular Customer Selected
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Phone: <span className="font-mono text-neutral-900 font-medium">{currentParticularCustomer.phone || 'N/A'}</span> · Email: {currentParticularCustomer.email}
                </p>
                {currentParticularCustomer.address?.house && (
                  <p className="text-[10px] text-neutral-500">
                    Address: {currentParticularCustomer.address.house}, {currentParticularCustomer.address.street}, {currentParticularCustomer.address.city}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setSelectedCustomerId('All')}
                className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 underline font-medium cursor-pointer"
              >
                Clear Customer Filter
              </button>
              <button
                type="button"
                onClick={() => setShowStatementModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                title="Open format options to print statement for this customer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement ({currentParticularCustomer.orderCount} Bills)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Customer Bills / Invoices Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900">
              Customer Billing Invoices ({filteredOrders.length})
            </h2>
            {selectedCustomerId !== 'All' && (
              <span className="text-xs text-neutral-500 font-normal">
                Filtered for <span className="font-bold text-neutral-800">{currentParticularCustomer?.name}</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-400">
            Click "Print Bill" to choose Standard A4 or Thermal (80mm) and open bill PDF directly in browser
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice / Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Product Items</th>
                <th className="py-3 px-4">Billing Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-neutral-400">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading customer billing records...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 space-y-2">
                    <Receipt className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-medium text-neutral-600">No customer bills match the selected criteria.</p>
                    <button
                      onClick={() => {
                        setSelectedCustomerId('All');
                        setSearch('');
                        setPaymentStatusFilter('All');
                        setDateFilter('all');
                      }}
                      className="text-xs text-emerald-700 underline font-semibold cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Invoice ID */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-neutral-900 block text-xs">
                        INV-{order._id.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Order #{order._id}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedCustomerId(order.customerId || order.customerEmail)}
                        className="text-left group cursor-pointer"
                        title="Click to filter bills for this customer"
                      >
                        <p className="font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                          {order.customerName}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">{order.customerPhone || order.customerEmail}</p>
                        <p className="text-[10px] text-neutral-400 truncate max-w-40">
                          {order.deliveryAddress.house}, {order.deliveryAddress.street}
                        </p>
                      </button>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 text-neutral-700">
                      <span className="font-semibold text-neutral-900 block">
                        {order.items.length} items
                      </span>
                      <p className="text-[10px] text-neutral-500 truncate max-w-44">
                        {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                      <span className="block text-[9px] text-neutral-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 text-sm tabular-nums">
                      ₹{order.totalAmount}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4">
                      <span className="text-neutral-700 font-medium block text-xs">{order.paymentMethod}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus === 'Paid' ? 'Paid' : 'COD Pending'}
                      </span>
                    </td>

                    {/* Print Bill Action: Choose A4 or Thermal 80mm & Open PDF Directly */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="Choose Standard A4 or Thermal (80mm) and open bill PDF directly in browser"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Bill Modal for Selected Order */}
      <PrintBillModal
        isOpen={Boolean(selectedOrderForPrint)}
        onClose={() => setSelectedOrderForPrint(null)}
        order={selectedOrderForPrint}
        storeInfo={storeInfo}
      />

      {/* Print Bill Modal for Customer Account Statement */}
      <PrintBillModal
        isOpen={showStatementModal && Boolean(currentParticularCustomer)}
        onClose={() => setShowStatementModal(false)}
        statementCustomer={currentParticularCustomer}
        customerOrders={orders.filter((o) => {
          if (!currentParticularCustomer) return false;
          const id = o.customerId || o.customerEmail;
          return id === currentParticularCustomer.id || o.customerName === currentParticularCustomer.name;
        })}
        storeInfo={storeInfo}
      />
    </div>
  );
};
