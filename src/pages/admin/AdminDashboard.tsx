import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Printer,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<{
    stats: {
      totalSales: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
      lowStockCount: number;
      outOfStockCount: number;
      pendingOrdersCount: number;
    };
    salesTrend: { day: string; sales: number; orders: number }[];
    topSellingProducts: { name: string; quantity: number; revenue: number; image: string }[];
    categorySales: { name: string; amount: number }[];
    recentOrders: Order[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{
    mongoConfigured: boolean;
    mongoConnected: boolean;
    errorType: 'AUTH_FAILED' | 'IP_NOT_WHITELISTED' | 'OTHER' | null;
    lastError: string | null;
    username: string;
    localCounts: Record<string, number>;
    mongoCounts: Record<string, number>;
    instructions: string;
  } | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [syncingMongo, setSyncingMongo] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchDbStatus = () => {
    api.getDatabaseStatus()
      .then((res) => {
        if (res.success) {
          setDbStatus(res.data);
          // Automatically show error popup if database is not connected, remove if connected
          if (!res.data.mongoConnected) {
            setShowErrorPopup(true);
          } else {
            setShowErrorPopup(false);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setShowErrorPopup(true);
      });
  };

  useEffect(() => {
    fetchDbStatus();
    api.getAdminDashboard()
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSyncMongo = async () => {
    setSyncingMongo(true);
    setSyncMessage(null);
    try {
      const res = await api.syncMongoDB();
      setSyncMessage(res.message);
      const statusRes = await api.getDatabaseStatus();
      if (statusRes.success) {
        setDbStatus(statusRes.data);
        if (statusRes.data.mongoConnected) {
          // Automatically remove popup if database successfully connected
          setShowErrorPopup(false);
        }
      }
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync failed.');
    } finally {
      setSyncingMongo(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-neutral-500 mt-2">Loading vendor sales analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    pendingOrdersCount: 0
  };

  const maxSale = Math.max(...(data?.salesTrend?.map((s) => s.sales) || [1000]));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">
              Vendor Overview & Analytics
            </h1>
            {dbStatus?.mongoConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Database Connected</span>
              </span>
            ) : (
              <button
                onClick={() => setShowErrorPopup(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition-colors animate-pulse cursor-pointer"
                title="Click to view database connection details"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Database Disconnected</span>
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Real-time business performance for FreshMart Palghar Market Outlet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/billing"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>Billing & Invoices</span>
          </Link>
          <Link
            to="/admin/products"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            + Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-lg transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Database Error Popup Modal - Only appears if database is NOT connected; auto-removed when connected */}
      {showErrorPopup && dbStatus && !dbStatus.mongoConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-50 via-white to-rose-50 border-b border-rose-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-base">
                    Database Connection Error
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5 font-medium">
                    MongoDB Atlas database is currently offline or disconnected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors text-lg leading-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-3.5 text-xs text-neutral-700 max-h-[70vh] overflow-y-auto">
              {dbStatus.errorType === 'AUTH_FAILED' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <p className="font-semibold text-rose-900">Authentication Failed (User or Password Mismatch)</p>
                    <p className="text-rose-700 mt-1">
                      MongoDB Atlas rejected credentials for user <strong className="font-mono text-neutral-900">{dbStatus.username || 'sononeabhay6_db_user'}</strong>.
                    </p>
                  </div>
                  <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                    <p className="font-bold text-neutral-900">How to fix in MongoDB Atlas:</p>
                    <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                      <li>Log into <strong>MongoDB Atlas</strong> (<a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">cloud.mongodb.com</a>).</li>
                      <li>Go to <strong>Security &rarr; Database Access</strong>.</li>
                      <li>Verify user <code className="bg-white px-1 py-0.5 rounded font-mono border border-neutral-200">{dbStatus.username || 'sononeabhay6_db_user'}</code> exists and set the password to match your URI.</li>
                      <li>Ensure role is <strong>"Read and write to any database"</strong>.</li>
                      <li>In <strong>Network Access</strong>, verify that <code className="bg-white px-1 py-0.5 rounded font-mono border border-neutral-200">0.0.0.0/0</code> is active.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="font-semibold text-amber-900">Network Access / IP Whitelist Required</p>
                    <p className="text-amber-700 mt-1">
                      MongoDB Atlas blocked the connection from the server IP address.
                    </p>
                  </div>
                  <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                    <p className="font-bold text-neutral-900">How to fix in MongoDB Atlas:</p>
                    <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                      <li>Log into <strong>MongoDB Atlas</strong> (<a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">cloud.mongodb.com</a>).</li>
                      <li>Go to <strong>Security &rarr; Network Access</strong>.</li>
                      <li>Click <strong>+ ADD IP ADDRESS</strong> &rarr; <strong>ALLOW ACCESS FROM ANYWHERE</strong> (sets <code className="bg-white px-1 py-0.5 rounded font-mono border border-neutral-200">0.0.0.0/0</code>) &rarr; <strong>Confirm</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {syncMessage && (
                <div className="p-2.5 rounded-lg bg-neutral-900 text-white text-xs">
                  {syncMessage}
                </div>
              )}

              <p className="text-[11px] text-neutral-500 italic">
                Note: The app is safely keeping your data in local storage. Once connected, your catalog and orders will sync to Atlas and this popup will automatically close.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowErrorPopup(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleSyncMongo}
                disabled={syncingMongo}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingMongo ? 'animate-spin' : ''}`} />
                <span>{syncingMongo ? 'Connecting & Syncing...' : 'Retry Connection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            ₹{stats.totalSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium block">
            From {stats.totalOrders} fulfilled orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {stats.totalOrders}
          </p>
          <span className="text-[11px] text-blue-700 font-medium block">
            {stats.pendingOrdersCount} orders currently in dispatch
          </span>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {stats.totalCustomers}
          </p>
          <span className="text-[11px] text-purple-700 font-medium block">
            Verified local households
          </span>
        </div>

        {/* Inventory Warning */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Attention</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tabular-nums">
            {stats.lowStockCount + stats.outOfStockCount}
          </p>
          <span className="text-[11px] text-amber-700 font-medium block">
            {stats.lowStockCount} low stock · {stats.outOfStockCount} out of stock
          </span>
        </div>
      </div>

      {/* Charts Section: Sales Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales by day bar chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Sales & Revenue (Last 7 Days)
              </h3>
              <p className="text-[11px] text-neutral-400">Daily gross amount collected across all delivery orders</p>
            </div>
          </div>

          <div className="pt-4 h-56 flex items-end justify-between gap-3">
            {data?.salesTrend?.map((item, idx) => {
              const heightPercent = maxSale > 0 ? Math.max(12, Math.round((item.sales / maxSale) * 100)) : 10;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-neutral-500 mb-1 group-hover:text-emerald-700 tabular-nums">
                    ₹{item.sales}
                  </span>
                  <div
                    className="w-full max-w-10 bg-emerald-100 group-hover:bg-emerald-600 rounded-t-md transition-colors relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {item.orders} orders
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-medium mt-2 truncate w-full text-center">
                    {item.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <h3 className="font-bold text-neutral-900 text-sm font-display">
            Revenue by Category
          </h3>

          <div className="space-y-3 pt-2">
            {data?.categorySales?.map((cat, idx) => {
              const totalAmount = data.stats.totalSales || 1;
              const pct = Math.round((cat.amount / totalAmount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{cat.name}</span>
                    <span className="font-mono text-neutral-900 tabular-nums">₹{cat.amount} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Products & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              Top Selling Products
            </h3>
            <Link to="/admin/products" className="text-xs text-emerald-700 hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {data?.topSellingProducts?.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                  />
                  <div>
                    <p className="font-semibold text-neutral-900 line-clamp-1">{item.name}</p>
                    <p className="text-neutral-500 font-mono tabular-nums">{item.quantity} units sold</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-neutral-900 tabular-nums">
                  ₹{item.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-sm font-display">
              Recent Orders Dispatch
            </h3>
            <Link to="/admin/orders" className="text-xs text-emerald-700 hover:underline font-semibold">
              Manage All Orders →
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {data?.recentOrders?.map((order) => (
              <div key={order._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{order._id}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600">{order.customerName}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {order.items.length} items · {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-neutral-900 tabular-nums">
                    ₹{order.totalAmount}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/admin/billing/print/${order._id}`}
                    className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 rounded transition-colors"
                    title="Open Bill Direct in Full Page"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
