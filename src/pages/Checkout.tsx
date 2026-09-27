import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Check, ArrowRight, ArrowLeft, QrCode, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const Checkout: React.FC = () => {
  const { items, subtotal, deliveryFee, discount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Multi-step: 1 = Contact, 2 = Address, 3 = Payment, 4 = Review
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Address
  const [house, setHouse] = useState(user?.address?.house || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [area, setArea] = useState(user?.address?.area || '');
  const [city, setCity] = useState(user?.address?.city || 'Palghar');
  const [state, setState] = useState(user?.address?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(user?.address?.pincode || '401404');
  const [landmark, setLandmark] = useState(user?.address?.landmark || '');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI' | 'Online Payment'>('Cash on Delivery');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (!email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.address) {
        if (!house) setHouse(user.address.house || '');
        if (!street) setStreet(user.address.street || '');
        if (!area) setArea(user.address.area || '');
        if (!city) setCity(user.address.city || 'Palghar');
        if (!pincode) setPincode(user.address.pincode || '401404');
        if (!landmark) setLandmark(user.address.landmark || '');
      }
    }
  }, [user]);

  const validateStep1 = () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      showToast('Please fill all contact fields.', 'error');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!house.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      showToast('Please fill all required address fields including pincode.', 'error');
      return false;
    }
    if (pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit PIN code.', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please log in or register to finalize your order.', 'error');
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity
        })),
        deliveryAddress: {
          fullName,
          phone,
          house,
          street,
          area,
          city,
          state,
          pincode,
          landmark
        },
        paymentMethod
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        clearCart();
        showToast('Order placed successfully! Vendor notified.', 'success');
        navigate(`/order-success/${res.order._id}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout step breadcrumbs */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display">
            Fast Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Palghar Local Vendor Doorstep Dispatch
          </p>
        </div>

        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          {[
            { num: 1, label: 'Contact' },
            { num: 2, label: 'Address' },
            { num: 3, label: 'Payment' },
            { num: 4, label: 'Review' }
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                currentStep === s.num
                  ? 'bg-emerald-600 text-white'
                  : currentStep > s.num
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          {/* STEP 1: Customer Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Step 1: Customer Contact Information
              </h2>
              <p className="text-xs text-neutral-500">
                The delivery partner will call this mobile number upon arrival.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Mobile Number (for delivery updates) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@freshmart.com"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {!user && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 mt-2">
                  <span>Already have an account? </span>
                  <Link to="/login?redirect=/checkout" className="font-bold underline">
                    Log in here
                  </Link>
                  <span> to save address & track orders seamlessly.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Delivery Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Step 2: Delivery Address
              </h2>
              <p className="text-xs text-neutral-500">
                Where should Ramesh Patel's team deliver your harvest?
              </p>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Flat / House / Building *
                    </label>
                    <input
                      type="text"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      placeholder="Flat 402, Gokul Residency"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Street / Road *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Manor Road"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Navali / Station"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Palghar"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="401404"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Opposite D-Mart or near temple"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Step 3: Choose Payment Method
              </h2>
              <p className="text-xs text-neutral-500">
                Safe, verified local transaction options.
              </p>

              <div className="space-y-3 pt-2">
                {/* Option 1: Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">
                        Cash on Delivery (COD) - Recommended
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Inspect your products at your doorstep upon arrival. Pay in cash after verifying freshness.
                    </p>
                  </div>
                </label>

                {/* Option 2: UPI */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">
                        UPI (GPay / PhonePe / Paytm / BHIM)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Scan vendor QR code or enter your VPA / UPI ID. Instant verification.
                    </p>
                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 p-3 bg-white border border-emerald-300 rounded-lg space-y-2">
                        <p className="text-xs font-semibold text-emerald-950">
                          Vendor UPI ID: <span className="font-mono text-emerald-700">freshmart.ramesh@okaxis</span>
                        </p>
                        <input
                          type="text"
                          placeholder="Or enter your UPI ID (e.g. mobile@upi)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-xs focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </label>

                {/* Option 3: Online Payment (Test Mode) */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'Online Payment'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={paymentMethod === 'Online Payment'}
                    onChange={() => setPaymentMethod('Online Payment')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">
                        Online Cards / Netbanking (Razorpay Gateway Test Mode)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Simulated safe online gateway for demonstration. Instant payment confirmation.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Final Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Step 4: Final Order Confirmation
              </h2>
              <p className="text-xs text-neutral-500">
                Please review your details before placing the order with vendor.
              </p>

              {/* Delivery details summary */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-neutral-900">{fullName}</p>
                    <p className="text-neutral-600">{phone} · {email}</p>
                    <p className="text-neutral-600 mt-1">
                      {house}, {street}, {area ? `${area}, ` : ''}{city}, {state} - {pincode}
                    </p>
                    {landmark && <p className="text-neutral-500 italic">Landmark: {landmark}</p>}
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
                  >
                    Edit Address
                  </button>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-neutral-700">
                  <span>Selected Payment: <strong>{paymentMethod}</strong></span>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Items Summary preview */}
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                {items.map((item) => (
                  <div key={item.productId} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold text-neutral-900">{item.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          {item.quantity} × {item.unit} @ ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Cart</span>
              </Link>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white font-bold text-sm rounded-lg shadow-md flex items-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Place Order (₹{total})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Summary Box */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-neutral-900 font-display">
            Order Review
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Total ({items.length} types)</span>
              <span className="font-mono font-semibold tabular-nums text-neutral-900">
                ₹{subtotal}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee</span>
              <span className="font-mono font-semibold tabular-nums">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-800">
                <span>Promotional Discount (5%)</span>
                <span className="font-mono font-semibold tabular-nums">-₹{discount}</span>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm font-bold text-neutral-900">
              <span>Amount Payable</span>
              <span className="text-xl font-mono tabular-nums text-emerald-800">
                ₹{total}
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <p className="font-semibold text-neutral-900 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Estimated Delivery: Today within 90 minutes
            </p>
            <p className="text-[11px] text-neutral-500">
              Dispatched from APMC Market Yard, Palghar West directly to your address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
