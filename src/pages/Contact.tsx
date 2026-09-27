import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { FreshMartLogo } from '../components/FreshMartLogo';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill all required contact fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been sent to Ramesh Patel & Sons! We will contact you shortly.', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-neutral-900 font-display">
          Contact FreshMart Vendor
        </h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
          Have an inquiry regarding bulk orders, marriage catering supply, or delivery to your area? Speak directly with our market stall team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <FreshMartLogo size="sm" subtitle="Official APMC Outlet" />
            </div>
            <h3 className="font-bold text-neutral-900 text-base font-display">
              Physical Stall & Outlet
            </h3>

            <div className="space-y-4 text-xs text-neutral-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block text-sm">FreshMart Local Store</strong>
                  <p>Shop No. 4, APMC Fruit & Vegetable Market Yard</p>
                  <p>Station Road, Opposite Railway Station</p>
                  <p>Palghar West, Maharashtra - 401404</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block text-sm">Operating Hours</strong>
                  <p>Open 7:00 AM – 9:00 PM</p>
                  <p className="text-neutral-400">All 7 days a week including public holidays</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block text-sm">Vendor Phone & WhatsApp</strong>
                  <p className="font-mono text-neutral-800">+91 98201 12345</p>
                  <p className="text-neutral-400">Direct line to Ramesh Patel</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block text-sm">Email Support</strong>
                  <p className="font-mono text-neutral-800">contact@freshmart.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery radius note */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold">Fast Neighborhood Dispatch Radius:</p>
            <p>We serve Palghar City, Navali, Manor Road, Shirgaon, Kelve Road, and Boisar Link with 90-minute express courier delivery.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900">Message Received!</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Thank you for getting in touch. Ramesh Patel or our head coordinator will call or email you back within 2 business hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 font-display">
                Send Us a Note or Inquiry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Message or Product Request *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what vegetables, fruits or specific weight you need..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm text-neutral-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
