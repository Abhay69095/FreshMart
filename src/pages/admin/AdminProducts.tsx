import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [stockQuantity, setStockQuantity] = useState('50');
  const [image, setImage] = useState('');
  const [freshness, setFreshness] = useState('Fresh Today');
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts({ search: search || undefined, category: categoryFilter !== 'All' ? categoryFilter : undefined, stockStatus: stockFilter !== 'all' ? stockFilter : undefined }),
        api.getCategories()
      ]);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, stockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Fresh Fruits');
    setDescription('Farm-harvested products sourced from local Palghar growers.');
    setPrice('50');
    setDiscountPrice('');
    setUnit('1 kg');
    setStockQuantity('40');
    setImage('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80');
    setFreshness('Fresh Today');
    setIsSeasonal(false);
    setIsOrganic(false);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description);
    setPrice(String(prod.price));
    setDiscountPrice(prod.discountPrice ? String(prod.discountPrice) : '');
    setUnit(prod.unit);
    setStockQuantity(String(prod.stockQuantity));
    setImage(prod.image);
    setFreshness(prod.freshness);
    setIsSeasonal(Boolean(prod.isSeasonal));
    setIsOrganic(Boolean(prod.isOrganic));
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stockQuantity) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    try {
      const payload: Partial<Product> = {
        name,
        category,
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        unit,
        stockQuantity: Number(stockQuantity),
        image,
        freshness,
        isSeasonal,
        isOrganic,
        isAvailable: Number(stockQuantity) > 0
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct._id, payload);
        if (res.success) {
          showToast(`Updated "${name}" successfully.`, 'success');
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast(`Added "${name}" to product catalog!`, 'success');
        }
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from the catalog?`)) {
      return;
    }

    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        showToast(`Removed "${prodName}".`, 'info');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleToggleAvailability = async (prod: Product) => {
    try {
      const newStatus = !prod.isAvailable;
      const res = await api.updateProduct(prod._id, { isAvailable: newStatus });
      if (res.success) {
        showToast(`Set "${prod.name}" as ${newStatus ? 'Available' : 'Unavailable'}.`, 'success');
        loadData();
      }
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            Product Catalog & Inventory Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage fruit & vegetable prices, stock quantities, and discounts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            placeholder="Search product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="py-2 px-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock (≤ 10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Unit</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const hasDisc = Boolean(prod.discountPrice && prod.discountPrice < prod.price);
                  const isOut = prod.stockQuantity === 0;
                  const isLow = !isOut && prod.stockQuantity <= 10;

                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                          />
                          <div>
                            <p className="font-semibold text-neutral-900 line-clamp-1">{prod.name}</p>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {prod._id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-700">
                        {prod.category}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono tabular-nums">
                          <span className="font-bold text-neutral-900">
                            ₹{prod.discountPrice || prod.price}
                          </span>
                          <span className="text-[11px] text-neutral-400 ml-1">/ {prod.unit}</span>
                          {hasDisc && (
                            <span className="block text-[10px] text-neutral-400 line-through">
                              ₹{prod.price}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                          <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-neutral-900'}>
                            {prod.stockQuantity}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-sans">{prod.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {prod.freshness}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(prod)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            prod.isAvailable && prod.stockQuantity > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                          title="Click to toggle availability"
                        >
                          {prod.isAvailable && prod.stockQuantity > 0 ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 rounded"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod._id, prod.name)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base font-display">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Farm Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fresh Hybrid Tomato"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  >
                    <option value="250 g">250 g</option>
                    <option value="500 g">500 g</option>
                    <option value="1 kg">1 kg</option>
                    <option value="2 kg">2 kg</option>
                    <option value="5 kg">5 kg</option>
                    <option value="Per piece">Per piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Standard Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Freshness Note</label>
                  <input
                    type="text"
                    value={freshness}
                    onChange={(e) => setFreshness(e.target.value)}
                    placeholder="Fresh Today / Morning Harvest"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOrganic}
                      onChange={(e) => setIsOrganic(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Organic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSeasonal}
                      onChange={(e) => setIsSeasonal(e.target.checked)}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>Seasonal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
