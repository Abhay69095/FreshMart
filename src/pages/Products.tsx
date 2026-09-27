import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RefreshCw } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter states initialized from URL params
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('availability') === 'in_stock');
  const [discountOnly, setDiscountOnly] = useState<boolean>(searchParams.get('discountOnly') === 'true');
  const [isOrganic, setIsOrganic] = useState<boolean>(searchParams.get('isOrganic') === 'true');
  const [isSeasonal, setIsSeasonal] = useState<boolean>(searchParams.get('isSeasonal') === 'true');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'popular');

  // Load categories once
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    }).catch(console.error);
  }, []);

  // Sync state if URL changes externally
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCat = searchParams.get('category') || 'All';
    setSearch(urlSearch);
    setSelectedCategory(urlCat);
  }, [searchParams]);

  // Fetch products with all filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          search: search.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          availability: inStockOnly ? 'in_stock' : undefined,
          discountOnly: discountOnly ? 'true' : undefined,
          isOrganic: isOrganic ? 'true' : undefined,
          isSeasonal: isSeasonal ? 'true' : undefined,
          sortBy
        };

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, minPrice, maxPrice, inStockOnly, discountOnly, isOrganic, isSeasonal, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setDiscountOnly(false);
    setIsOrganic(false);
    setIsSeasonal(false);
    setSortBy('popular');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== 'All' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStockOnly ||
    discountOnly ||
    isOrganic ||
    isSeasonal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">
            {selectedCategory !== 'All' ? selectedCategory : 'All Farm Products'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Browse our full catalog of daily-harvested fruits, vegetables, and kitchen essentials.
          </p>
        </div>

        {/* Quick Search & Sort Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-3 bg-white border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="popular">Sort: Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden p-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50"
            title="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block space-y-6">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === 'All'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.name
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
                      {cat.itemCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
                Price Range (₹)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-neutral-100 space-y-2.5">
              <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Product Attributes
              </h4>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Discounted Deals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Certified Organic</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={isSeasonal}
                  onChange={(e) => setIsSeasonal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Seasonal Harvest</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-900/60 flex justify-end md:hidden">
            <div className="w-80 max-w-full bg-white h-full p-5 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile categories */}
              <div>
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">Category</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { setSelectedCategory('All'); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded ${selectedCategory === 'All' ? 'bg-emerald-50 text-emerald-800 font-bold' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => { setSelectedCategory(c.name); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded ${selectedCategory === c.name ? 'bg-emerald-50 text-emerald-800 font-bold' : ''}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Toggles */}
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  <span>In Stock Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={discountOnly} onChange={(e) => setDiscountOnly(e.target.checked)} />
                  <span>Discounted Deals</span>
                </label>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 text-xs font-semibold border rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-4">
          {/* Header count info */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              Showing <strong className="text-neutral-900 font-mono tabular-nums">{products.length}</strong> items
              {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              {search ? ` matching "${search}"` : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-neutral-200 rounded-lg"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">No Products Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We couldn't find any products matching your current search or filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
