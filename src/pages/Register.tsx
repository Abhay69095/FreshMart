import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FreshMartLogo } from '../components/FreshMartLogo';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Palghar');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please provide your name, email, and password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        phone,
        address: { city, state: 'Maharashtra', pincode: '401404' }
      });
      showToast(`Welcome to FreshMart, ${user.name}!`, 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <FreshMartLogo size="lg" className="mx-auto" />
          <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
            Create Customer Account
          </h1>
          <p className="text-xs text-neutral-500">
            Enjoy fresh products from local farmers delivered to your doorstep.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              City / Locality
            </label>
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Palghar"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Password (min 6 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register & Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
