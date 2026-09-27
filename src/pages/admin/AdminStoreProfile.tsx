import React, { useEffect, useState } from 'react';
import { Store, Check, MapPin, Phone, Mail, Clock, Truck } from 'lucide-react';
import { StoreInfo } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminStoreProfile: React.FC = () => {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [location, setLocation] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('15');
  const [deliveryFeeStandard, setDeliveryFeeStandard] = useState('40');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('499');
  const [aboutVendor, setAboutVendor] = useState('');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    api.getStore()
      .then((res) => {
        if (res.success && res.store) {
          const s = res.store;
          setStore(s);
          setStoreName(s.storeName);
          setVendorName(s.vendorName);
          setLocation(s.location);
          setFullAddress(s.fullAddress);
          setPhone(s.phone);
          setSupportEmail(s.supportEmail);
          setOpeningHours(s.openingHours);
          setDeliveryRadiusKm(String(s.deliveryRadiusKm));
          setDeliveryFeeStandard(String(s.deliveryFeeStandard));
          setFreeDeliveryThreshold(String(s.freeDeliveryThreshold));
          setAboutVendor(s.aboutVendor);
          setIsAcceptingOrders(s.isAcceptingOrders);
        }
      })
      .catch((err) => {
        showToast('Failed to load store profile', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<StoreInfo> = {
        storeName,
        vendorName,
        location,
        fullAddress,
        phone,
        supportEmail,
        openingHours,
        deliveryRadiusKm: Number(deliveryRadiusKm),
        deliveryFeeStandard: Number(deliveryFeeStandard),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        aboutVendor,
        isAcceptingOrders
      };

      const res = await api.updateStore(payload);
      if (res.success) {
        showToast('Store settings & vendor information updated!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update store settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-400">Loading store settings...</div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 font-display">
          Vendor & Store Profile Configuration
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Update physical stall information, business hours, and doorstep delivery thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        {/* Basic Brand Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            1. Store Identity & Vendor Ownership
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Vendor / Proprietor Name *
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Vendor Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Support Email *
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Opening Hours *
              </label>
              <input
                type="text"
                required
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="7:00 AM – 9:00 PM"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Physical Address */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            2. Physical Mandi Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Short City / State Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Full Physical Stall Address
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Delivery Rates & Settings */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            3. Delivery Fees & Coverage Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={deliveryFeeStandard}
                onChange={(e) => setDeliveryFeeStandard(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Delivery Radius (Kilometers)
              </label>
              <input
                type="number"
                value={deliveryRadiusKm}
                onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={isAcceptingOrders}
                onChange={(e) => setIsAcceptingOrders(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Store is currently OPEN and accepting new customer orders</span>
            </label>
          </div>
        </div>

        {/* About Vendor Bio */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            4. About Vendor Story
          </h3>
          <textarea
            rows={3}
            value={aboutVendor}
            onChange={(e) => setAboutVendor(e.target.value)}
            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Store Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
