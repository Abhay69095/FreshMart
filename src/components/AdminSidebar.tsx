import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Receipt,
  Users,
  Boxes,
  Store,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FreshMartLogo } from './FreshMartLogo';

export const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products Catalog', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { to: '/admin/billing', label: 'Billing & Invoices', icon: Receipt },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/inventory', label: 'Stock & Inventory', icon: Boxes },
    { to: '/admin/store', label: 'Store Profile', icon: Store }
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 min-h-screen flex flex-col justify-between shrink-0 border-r border-neutral-800">
      <div>
        {/* Admin Header */}
        <div className="p-5 border-b border-neutral-800">
          <Link to="/" className="flex items-center group">
            <FreshMartLogo variant="dark" size="sm" subtitle="Vendor Admin Portal" />
          </Link>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-neutral-800/80 bg-neutral-950/40">
          <p className="text-xs text-neutral-400">Logged in as:</p>
          <p className="text-sm font-semibold text-white truncate">{user?.name || 'Ramesh Patel'}</p>
          <p className="text-[11px] text-emerald-400 mt-0.5">Verified Local Vendor</p>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-neutral-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Shop</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
