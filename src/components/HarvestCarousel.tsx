import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeStyle?: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'harvest-1',
    image: '/src/assets/images/hero_fresh_produce_1790440960828.jpg',
    title: "Ramesh Patel's Daily Harvest",
    subtitle: 'APMC Palghar Market · Plucked 6:00 AM',
    badge: 'Farm Active',
    badgeStyle: 'bg-emerald-900/80 text-emerald-400 border-emerald-700',
  },
  {
    id: 'harvest-2',
    image: '/src/assets/images/fresh_vegetables_assortment_1790441003951.jpg',
    title: 'Crisp Greens & Root Vegetables',
    subtitle: 'Palghar Valley Farms · Sorted at Dawn',
    badge: '100% Fresh',
    badgeStyle: 'bg-teal-900/80 text-teal-300 border-teal-700',
  },
  {
    id: 'harvest-3',
    image: '/src/assets/images/seasonal_fruits_basket_1790440987001.jpg',
    title: 'Sweet Seasonal Fruit Crates',
    subtitle: 'Ratnagiri & Nashik Orchards · Tree-Ripened',
    badge: 'Handpicked',
    badgeStyle: 'bg-amber-900/80 text-amber-300 border-amber-700',
  },
  {
    id: 'harvest-4',
    image: '/src/assets/images/vendor_storefront_1790440973790.jpg',
    title: "Ramesh's Mandi Stall #4",
    subtitle: 'APMC Yard Palghar · Direct Grower Network',
    badge: 'Local Vendor',
    badgeStyle: 'bg-emerald-900/80 text-emerald-300 border-emerald-700',
  },
];

export const HarvestCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = CAROUSEL_SLIDES.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Automatically cycle images every 3 seconds (3000ms)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const activeSlide = CAROUSEL_SLIDES[currentIndex];

  return (
    <div
      className="relative group rounded-2xl overflow-hidden shadow-2xl border border-emerald-800/80 bg-emerald-900/50 p-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image Viewport */}
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full bg-emerald-950">
        {CAROUSEL_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-black/20" />
            </div>
          );
        })}

        {/* Live Auto-cycle Indicator Pill (Top Left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/20 rounded-full text-white text-[11px] font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Harvest</span>
          <span className="text-[10px] text-emerald-300 font-mono">3s Auto</span>
        </div>

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-emerald-600/90 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-emerald-600/90 text-white backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 3-Second Segmented Progress Bar & Pagination Dots (Bottom of Image) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
          {CAROUSEL_SLIDES.map((_, idx) => {
            const isDotActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="group/dot relative py-1 px-0.5 focus:outline-none"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDotActive
                      ? 'w-6 bg-emerald-400'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Details Bar (Ramesh Patel's Daily Harvest, APMC Market, Badge) */}
      <div className="p-4 bg-emerald-950/80 rounded-b-xl flex items-center justify-between text-xs transition-all duration-500">
        <div className="min-w-0 pr-3">
          <p className="font-semibold text-white truncate transition-all duration-300">
            {activeSlide.title}
          </p>
          <p className="text-emerald-300/90 text-[11px] truncate transition-all duration-300">
            {activeSlide.subtitle}
          </p>
        </div>
        <span
          className={`shrink-0 font-bold border px-2.5 py-1 rounded text-xs transition-colors duration-300 ${
            activeSlide.badgeStyle || 'bg-emerald-900/80 text-emerald-400 border-emerald-700'
          }`}
        >
          {activeSlide.badge}
        </span>
      </div>
    </div>
  );
};
