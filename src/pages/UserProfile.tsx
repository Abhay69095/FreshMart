import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Phone, Mail, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }

    setName(user.name || '');
    setPhone(user.phone || '');
    if (user.address) {
      setHouse(user.address.house || '');
      setStreet(user.address.street || '');
      setArea(user.address.area || '');
      setCity(user.address.city || 'Palghar');
      setState(user.address.state || 'Maharashtra');
      setPincode(user.address.pincode || '401404');
      setLandmark(user.address.landmark || '');
    }
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        address: {
          house,
          street,
          area,
          city,
          state,
          pincode,
          landmark
        }
      };

      const res = await api.updateProfile(payload);
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Profile and delivery address updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
          My Account & Delivery Address
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Manage your contact credentials and default shipping details for speedy checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-base">{user.name}</h3>
            <p className="text-xs text-neutral-500">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded uppercase">
              {user.role}
            </span>
          </div>

          <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs">
            <Link
              to="/my-orders"
              className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>My Orders</span>
              </span>
              <span className="font-semibold text-neutral-900">→</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Dashboard</span>
                </span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Editable Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900 font-display">
              Personal & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                Saved Delivery Address
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">House / Flat No.</label>
                    <input
                      type="text"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Street / Road</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Area / Colony</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near school, temple, or station"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
