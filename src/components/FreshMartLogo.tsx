import React, { useState } from 'react';

interface FreshMartLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  subtitle?: string;
  className?: string;
}

export const FreshMartLogo: React.FC<FreshMartLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  subtitle,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimension mapping
  const sizeMap = {
    xs: { img: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    sm: { img: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    md: { img: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { img: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Mascot Icon Badge */}
      <div
        className={`${currentSize.img} rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center relative transition-transform group-hover:scale-105 duration-200 border ${
          isDark ? 'border-emerald-500/30 bg-neutral-900' : 'border-emerald-100 bg-white'
        }`}
      >
        {!imageError ? (
          <img
            src="/src/assets/images/freshmart_apple_mascot_1790443760301.jpg"
            alt="FreshMart Mascot Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-0.5 rounded-xl bg-white"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity Vector Fallback */
          <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-black">
            <svg
              className="w-3/5 h-3/5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a9 9 0 0 1 9 9v1a9 9 0 0 1-9 9 9 9 0 0 1-9-9v-1a9 9 0 0 1 9-9z" fill="#059669" />
              <path d="M12 2c2 4 1 7-1 9-2 2-3 5-1 8" stroke="#ffffff" />
              <path d="M8 8c2.5-1 5 1 7 4" stroke="#ffffff" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-extrabold tracking-tight ${currentSize.text} ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Fresh<span className="text-emerald-500">Mart</span>
          </span>
          {subtitle && (
            <span
              className={`font-semibold tracking-wider uppercase mt-0.5 ${currentSize.sub} ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
