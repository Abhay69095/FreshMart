import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, Plus, ArrowUpRight, Search } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts({ stockStatus: filter !== 'all' ? filter : undefined });
      if (res.success) setProducts(res.products);
    } catch (err) {
      showToast('Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const handleQuickRestock = async (product: Product, amount: number) => {
    try {
      const res = await api.restockProduct(product._id, amount);
      if (res.success) {
        showToast(res.message, 'success');
        loadInventory();
      }
    } catch (err: any) {
      showToast(err.message || 'Restock failed', 'error');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stockQuantity <= 10 && p.stockQuantity > 0).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 font-display">
          Stock & Inventory Management
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Monitor farm crate inventory levels, receive low stock warnings, and trigger instant restocks.
        </p>
      </div>

      {/* Warnings & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'all' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">All Catalog Stock</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 font-mono mt-1 tabular-nums">
            {products.length} Products
          </p>
        </div>

        <div
          onClick={() => setFilter('low')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'low' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs">
            <span className="font-bold uppercase tracking-wider">Low Stock Warning (≤ 10)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-900 font-mono mt-1 tabular-nums">
            {lowStockCount} Items
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Require morning mandi restock</span>
        </div>

        <div
          onClick={() => setFilter('out')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === 'out' ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20' : 'bg-white border-neutral-200'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs">
            <span className="font-bold uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-rose-900 font-mono mt-1 tabular-nums">
            {outOfStockCount} Items
          </p>
          <span className="text-[11px] text-rose-700 font-medium">Unavailable to customers</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search inventory products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Stock Alert</th>
                <th className="py-3 px-4 text-right">Quick Restock (+Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">Loading inventory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">No products matching inventory filter.</td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isOut = prod.stockQuantity === 0;
                  const isLow = !isOut && prod.stockQuantity <= 10;

                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded object-cover bg-neutral-100"
                          />
                          <div>
                            <p className="font-semibold text-neutral-900">{prod.name}</p>
                            <p className="text-[10px] text-neutral-400">₹{prod.discountPrice || prod.price} / {prod.unit}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-700">{prod.category}</td>

                      <td className="py-3 px-4 font-mono font-bold tabular-nums">
                        <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-neutral-900'}>
                          {prod.stockQuantity}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-sans ml-1">{prod.unit}</span>
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Good Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickRestock(prod, 10)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-800 border border-neutral-200 rounded font-semibold text-[11px] transition-colors"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickRestock(prod, 25)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 text-neutral-800 hover:text-emerald-800 border border-neutral-200 rounded font-semibold text-[11px] transition-colors"
                          >
                            +25
                          </button>
                          <button
                            onClick={() => handleQuickRestock(prod, 50)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition-colors shadow-xs"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
