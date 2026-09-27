import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X, ShieldCheck, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FreshMartLogo } from './FreshMartLogo';

export const Navbar: React.FC = () => {
  const { user, logout, wishlist } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top micro bar for quick store alert */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1 px-4 text-center font-medium">
        <span>Daily Farm Pluck: Free delivery on orders over ₹499 · Fresh harvested today from Palghar farms</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single element wordmark brand with official logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <FreshMartLogo size="sm" />
          </Link>

          {/* Desktop Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <input
              type="text"
              placeholder="Search farm fresh fruits, tomatoes, spinach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </form>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link to="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-emerald-700 transition-colors">Products</Link>
            <Link to="/categories" className="hover:text-emerald-700 transition-colors">Categories</Link>
            <Link to="/about" className="hover:text-emerald-700 transition-colors">Our Story</Link>
            <Link to="/faq" className="hover:text-emerald-700 transition-colors">FAQ</Link>
          </nav>

          {/* Zone 3: Actions (Wishlist, Cart, User/Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Assistant Quick Trigger */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-freshmart-ai-chat'))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-semibold transition-all hover:scale-102 active:scale-95 shadow-2xs"
              title="Ask Freshy AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
              <span className="hidden xs:inline">Ask AI</span>
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-neutral-700 hover:text-emerald-600 hover:bg-neutral-100 rounded-lg relative transition-colors"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-neutral-700 hover:text-emerald-600 hover:bg-neutral-100 rounded-lg relative transition-colors flex items-center gap-1"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Admin Badge Shortcut */}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Vendor Admin</span>
              </Link>
            )}

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs sm:text-sm font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </span>
                  <span className="hidden sm:inline max-w-24 truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-neutral-200 py-1.5 z-50 text-sm"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>

                    <Link to="/profile" className="flex items-center gap-2 px-3.5 py-2 hover:bg-neutral-50 text-neutral-700">
                      <UserIcon className="w-4 h-4 text-neutral-500" />
                      <span>My Profile & Address</span>
                    </Link>

                    <Link to="/my-orders" className="flex items-center gap-2 px-3.5 py-2 hover:bg-neutral-50 text-neutral-700">
                      <ShoppingBag className="w-4 h-4 text-neutral-500" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2 px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Vendor Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-neutral-100 mt-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search fresh vegetables, fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-neutral-700 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-freshmart-ai-chat'));
                }}
                className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold flex items-center gap-2 text-left"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Ask Freshy AI Assistant</span>
              </button>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                Home
              </Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                All Products Catalog
              </Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                Browse Categories
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                About FreshMart
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                Contact Vendor
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded hover:bg-neutral-100">
                FAQ & Delivery Help
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 font-semibold">
                  Vendor Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
