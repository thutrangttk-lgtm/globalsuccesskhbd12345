import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f0f7f7] font-sans text-slate-800 w-full overflow-x-hidden">
      {/* Desktop Fixed Sidebar (> 1024px) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Slide-in Drawer (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-in Drawer Container */}
          <div className="relative z-10 w-64 max-w-[80vw] h-full bg-white shadow-2xl transition-transform transform duration-300 ease-in-out">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-full">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

