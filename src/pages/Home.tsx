import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Clock, MapPin, Star, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { HarvestCarousel } from '../components/HarvestCarousel';

export const Home: React.FC = () => {
  const [fruits, setFruits] = useState<Product[]>([]);
  const [vegetables, setVegetables] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [seasonal, setSeasonal] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, catRes] = await Promise.all([
          api.getFeaturedProducts(),
          api.getCategories()
        ]);
        if (featuredRes.success) {
          setFruits(featuredRes.fruits || []);
          setVegetables(featuredRes.vegetables || []);
          setBestDeals(featuredRes.bestDeals || []);
          setSeasonal(featuredRes.seasonal || []);
        }
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-emerald-950 text-white overflow-hidden py-14 sm:py-20">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_fresh_produce_1790440960828.jpg"
            alt="Farm fresh background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-900/80 border border-emerald-700/60 px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Empowering Palghar Local Farm Vendors · 100% Hand-Graded</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-white leading-tight">
                Fresh Fruits & Vegetables, <span className="text-emerald-400">Delivered Fresh.</span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                Shop fresh products from your local vendor and get it delivered to your doorstep within 90 minutes. Zero cold storage chemicals, harvested this morning.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/categories"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-lg border border-white/20 transition-all"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Micro Trust Markers */}
              <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-4 text-xs text-emerald-200">
                <div>
                  <p className="text-white font-bold font-mono text-base tabular-nums">90 Mins</p>
                  <p className="text-[11px] text-emerald-300/80">Express Neighborhood Delivery</p>
                </div>
                <div>
                  <p className="text-white font-bold font-mono text-base tabular-nums">100% Cash</p>
                  <p className="text-[11px] text-emerald-300/80">On Delivery Inspect & Pay</p>
                </div>
                <div>
                  <p className="text-white font-bold font-mono text-base tabular-nums">₹499+</p>
                  <p className="text-[11px] text-emerald-300/80">Zero Delivery Fee Threshold</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase - Auto 3-sec Harvest Carousel */}
            <div className="lg:col-span-5 relative">
              <HarvestCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FRESH FROM LOCAL VENDORS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
          <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden relative">
            <img
              src="/src/assets/images/vendor_storefront_1790440973790.jpg"
              alt="Local Vendor Stall"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-neutral-900/80 text-white text-[11px] font-medium px-2 py-0.5 rounded">
              Palghar Market Yard
            </span>
          </div>
          <div className="w-full md:w-2/3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <MapPin className="w-4 h-4" />
              <span>Direct From Your Local Vendor: Ramesh Patel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-display">
              Taking Local Mandi Fruits & Veggies Online
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              When you buy on FreshMart, you are supporting independent cultivators and traditional stall owners. Every tomato, bunch of coriander, and box of apples is weighed accurately with digital scales, hygienic packaging, and zero inflated corporate overheads.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Physical Store: APMC Yard Shop 4
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Open 7:00 AM – 9:00 PM Daily
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Browse Harvest</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">Popular Categories</h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-3 rounded-xl border border-neutral-200 text-center hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden mb-2 bg-neutral-100 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-semibold text-neutral-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-neutral-400 font-mono mt-0.5 tabular-nums">
                {cat.itemCount || 0} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BEST DEALS SECTION */}
      {bestDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Today's Savings</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">Best Deals on Fresh Products</h2>
            </div>
            <Link
              to="/products?discountOnly=true"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>See All Deals</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. FRESH FRUITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sweet & Juicy</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">Fresh Orchard Fruits</h2>
          </div>
          <Link
            to="/products?category=Fresh Fruits"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Fruits</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fruits.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. FRESH VEGETABLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Daily Kitchen Staples</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">Farm-Harvested Vegetables</h2>
          </div>
          <Link
            to="/products?category=Fresh Vegetables"
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Vegetables</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vegetables.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 7. SEASONAL HARVEST */}
      {seasonal.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Peak Season Delights</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">Seasonal Specials</h2>
            </div>
            <Link
              to="/products?isSeasonal=true"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Seasonal</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonal.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 8. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Simple Process</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display mt-1">
            How FreshMart Works
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Get products fresh from morning crates to your dining table in 3 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Select Fresh Products</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Browse our daily catalog of over 20+ farm-fresh fruits, vegetables, and leafy greens. Add your exact weight needed to cart.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Local Vendor Weighs & Packs</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Vendor Ramesh Patel personally inspects each vegetable, verifies weight on certified scales, and packs into eco-friendly bags.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Doorstep Delivery & COD</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Delivered within 90 minutes. Inspect your tomatoes and greens at your door before paying cash or via UPI QR code.
            </p>
          </div>
        </div>
      </section>

      {/* 9. WHY CHOOSE FRESHMART */}
      <section className="bg-neutral-100 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Unmatched Quality</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display">
                Why Neighborhood Families Prefer FreshMart
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Supermarket products spend 4-6 days travelling through centralized distribution warehouses and cold storage rooms before reaching retail shelves. FreshMart eliminates the entire supply chain waste:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">Zero Prolonged Cold Storage</h4>
                    <p className="text-xs text-neutral-500">Products retain their natural vitamins, chlorophyll, crispness, and authentic earthy aroma.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">Fair Wholesale Rates</h4>
                    <p className="text-xs text-neutral-500">Tomatoes at ₹40/kg, onions at ₹38/kg — genuine mandi prices without convenience markups.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">Community Vendor Empowerment</h4>
                    <p className="text-xs text-neutral-500">Every rupee stays in the local economy, sustaining traditional hardworking vendor livelihoods.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
                <span className="text-3xl font-bold text-emerald-700 font-mono tabular-nums">3,400+</span>
                <h4 className="text-sm font-semibold text-neutral-900 mt-1">Orders Fulfilled</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Across Palghar district households.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
                <span className="text-3xl font-bold text-emerald-700 font-mono tabular-nums">4.9 / 5</span>
                <h4 className="text-sm font-semibold text-neutral-900 mt-1">Quality Rating</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Verified customer satisfaction.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
                <span className="text-3xl font-bold text-emerald-700 font-mono tabular-nums">90 Mins</span>
                <h4 className="text-sm font-semibold text-neutral-900 mt-1">Average Delivery</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Fast local neighborhood routing.</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
                <span className="text-3xl font-bold text-emerald-700 font-mono tabular-nums">100%</span>
                <h4 className="text-sm font-semibold text-neutral-900 mt-1">Fresh Guarantee</h4>
                <p className="text-xs text-neutral-500 mt-0.5">Instant replacement if not satisfied.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Testimonials</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-display mt-1">
            Loved By Palghar Families
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed italic">
              "The Ratnagiri Alphonso mangoes and hybrid tomatoes were in peak condition. Ramesh bhai takes extra care packing them so they don't bruise. Best local grocery initiative!"
            </p>
            <div className="pt-2 border-t border-neutral-100">
              <p className="text-xs font-bold text-neutral-900">Rahul Sharma</p>
              <p className="text-[11px] text-neutral-400">Gokul Residency, Palghar</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed italic">
              "Spinach and coriander arrived still dewy from morning harvest. Supermarkets can never match this speed or freshness. And Cash on Delivery makes it completely worry-free."
            </p>
            <div className="pt-2 border-t border-neutral-100">
              <p className="text-xs font-bold text-neutral-900">Priya Verma</p>
              <p className="text-[11px] text-neutral-400">Sunshine Colony, Shirgaon</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-3">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed italic">
              "Being able to track the order from 'Harvesting & Packing' to 'Out for Delivery' in real-time gives immense peace of mind. Delivery arrived in under 45 minutes."
            </p>
            <div className="pt-2 border-t border-neutral-100">
              <p className="text-xs font-bold text-neutral-900">Dr. Amit Joshi</p>
              <p className="text-[11px] text-neutral-400">Green Meadows, Mahim Rd</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold font-display">
              Ready for Pure Farm Freshness?
            </h2>
            <p className="text-sm text-emerald-200 leading-relaxed">
              Order fresh fruits and daily vegetables now. Free delivery for all orders over ₹499.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/products"
                className="px-6 py-3 bg-white text-emerald-950 font-bold text-sm rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Start Shopping Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
