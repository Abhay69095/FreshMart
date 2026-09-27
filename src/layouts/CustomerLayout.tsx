import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AIChatBot } from '../components/AIChatBot';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AIChatBot />
    </div>
  );
};
