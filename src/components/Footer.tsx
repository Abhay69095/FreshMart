import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Truck, CheckCircle } from 'lucide-react';
import { FreshMartLogo } from './FreshMartLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-14 pb-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">90-Minute Express Delivery</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Direct from local Palghar wholesale yard to your doorstep.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Morning Pluck Freshness</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Hand-graded vegetables and fruits with zero warehouse cold-burn.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Direct Farmer Empowerment</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Local cultivators receive fair prices without predatory middlemen.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cash on Delivery & Easy Pay</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Pay after inspecting your products or pay seamlessly via UPI.</p>
            </div>
          </div>
        </div>

        {/* Links & Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand info */}
          <div className="space-y-4">
            <FreshMartLogo variant="dark" size="md" subtitle="Online Mandi & Farm Direct" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Empowering local fruit and vegetable vendors to serve neighborhood families with hygienic, crisp, farm-to-table groceries.
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1">
              <p className="text-neutral-300 font-semibold">FreshMart Local Store</p>
              <p>Vendor: Sonone & Sons</p>
              <p>Palghar, Maharashtra - 401404</p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-emerald-400 transition-colors">All Fruits & Vegetables</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-emerald-400 transition-colors">Browse 8 Categories</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-emerald-400 transition-colors">My Wishlist</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-emerald-400 transition-colors">Track My Order</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition-colors">View Cart</Link>
              </li>
            </ul>
          </div>

          {/* Information & Trust */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Our Vendor Mission</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact & Vendor Location</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Vendor Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Store Hours & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Store Timings & Contact</h3>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-200 font-medium">Daily Store Hours:</span>
                  <p>7:00 AM – 9:00 PM (Monday – Sunday)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-200 font-medium">Vendor Helpline:</span>
                  <p>+91 98201 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-200 font-medium">Email:</span>
                  <p>contact@freshmart.com</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-neutral-200 font-medium">Market Stall:</span>
                  <p>Shop 4, APMC Market Yard, Station Rd, Palghar (W)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} FreshMart Online Store. Created for Local Vendors & Fresh Agriculture.</p>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">Built with Node.js, Express, React & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
