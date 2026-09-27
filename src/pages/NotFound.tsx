import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center space-y-4">
      <div className="max-w-md w-full space-y-4">
        <span className="text-6xl font-extrabold text-emerald-600 font-mono">404</span>
        <h1 className="text-2xl font-bold text-neutral-900 font-display">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          The page or product catalog item you are looking for has been moved or doesn't exist.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to FreshMart Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
