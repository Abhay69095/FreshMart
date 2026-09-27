import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 font-display">
          Product Categories
        </h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
          Explore our range of orchard fruits, daily root vegetables, organic leafy greens, and aromatic herbs hand-picked by local farmers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-neutral-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col"
            >
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-neutral-900/80 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded tabular-nums">
                  {cat.itemCount || 0} Products
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-emerald-700 gap-1">
                  <span>Browse Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
