import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Layers } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('Farm-fresh product category');
    setImage('https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await api.updateCategory(editingCategory._id, { name, description, image });
        if (res.success) {
          showToast(`Updated "${name}" category!`, 'success');
        }
      } else {
        const res = await api.createCategory({ name, description, image });
        if (res.success) {
          showToast(`Created "${name}" category!`, 'success');
        }
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast(err.message || 'Error saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await api.deleteCategory(cat._id);
      if (res.success) {
        showToast(`Category "${cat.name}" deleted.`, 'info');
        loadCategories();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            Product Categories Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize catalog classifications for easy customer discovery.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-200 animate-pulse rounded-xl"></div>
          ))
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] bg-neutral-100 relative">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-neutral-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded tabular-nums">
                    {cat.itemCount || 0} products
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-neutral-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="p-3 border-t border-neutral-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-neutral-100 rounded"
                  title="Edit category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base font-display">
                {editingCategory ? `Edit Category` : 'New Product Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Exotic & Seasonal"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                />
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
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
