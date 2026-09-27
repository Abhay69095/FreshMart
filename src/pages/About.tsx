import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Users, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { FreshMartLogo } from '../components/FreshMartLogo';

export const About: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Top Banner */}
      <section className="bg-emerald-950 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <FreshMartLogo variant="dark" size="lg" className="mx-auto mb-2" subtitle="Palghar Farm Direct" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Our Mission & Roots
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display">
            Taking Palghar's Local Products Vendors Online
          </h1>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed max-w-2xl mx-auto">
            FreshMart was created to solve a real dilemma: traditional local fruit & vegetable vendors work tirelessly from 4:00 AM, yet lose ground to commercial app monopolies that charge high markups and deliver stale warehouse vegetables.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm aspect-[4/3]">
            <img
              src="/src/assets/images/vendor_storefront_1790440973790.jpg"
              alt="FreshMart local stall"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              From Mandi to Doorstep
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 font-display">
              Founded by Ramesh Patel & Local Farming Partners
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Operating out of APMC Yard Stall No. 4 in Palghar, Ramesh Patel has spent over 25 years building direct ties with cultivators in Manor, Dahanu, and Wada. FreshMart modernizes this trusted connection.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every evening, orders are aggregated. At 5:00 AM, products are received directly from farm carts, digitally weighed, inspected for natural freshness, packed in eco-friendly cotton and paper wraps, and dispatched by 7:00 AM.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="bg-neutral-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">
              Our 4 Quality Guarantees
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Zero Cold-Storage Shock</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Vegetables are never frozen or chemically gas-ripened in mega warehouses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">True Mandi Weights</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Govt-certified electronic digital scales ensure customers get every gram they pay for.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Fair Farmer Remuneration</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                85% of each sale proceeds go straight back to rural cultivators and local staff.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Inspect Before Paying</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Cash on delivery allows you to check every tomato and spinach leaf first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900 font-display">
          Experience Freshness Today
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Taste the crisp difference between real morning-plucked vegetables and days-old supermarket stock.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm"
        >
          <span>Shop Fresh Harvest</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
