import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  LibraryBig, 
  Sparkles, 
  FilePenLine, 
  Database, 
  FileText, 
  FolderArchive, 
  Settings as SettingsIcon,
  Heart
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-[#e0f0ee] min-h-screen flex flex-col justify-between shrink-0 p-5 shadow-sm">
      <div className="space-y-6">
        
        {/* Top App Logo & Brand */}
        <Link to="/" className="flex items-center space-x-3 px-2 py-1 group">
          <div className="bg-[#0d9488] p-2.5 rounded-2xl text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wide text-[#0d9488] block leading-tight">
              LESSON PLAN
            </span>
            <span className="text-[11px] font-bold text-[#14b8a6] uppercase tracking-wider block">
              GLOBAL SUCCESS
            </span>
          </div>
        </Link>

        {/* Dashboard Link */}
        <Link
          to="/"
          className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${
            isActive('/')
              ? 'bg-[#e6f7f5] text-[#0d9488] shadow-sm'
              : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
          }`}
        >
          <Home className="w-4 h-4 text-[#0d9488]" />
          <span>Dashboard</span>
        </Link>

        {/* LESSON PLAN CREATION GROUP */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-4 mb-2">
            Lesson Plan Creation
          </p>

          <Link
            to="/create/global-success"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/create/global-success')
                ? 'bg-[#e6f7f5] text-[#0d9488] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#0d9488]" />
            <span>Global Success</span>
          </Link>

          <Link
            to="/create/move-up"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/create/move-up')
                ? 'bg-[#eff6ff] text-[#1d4ed8] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1d4ed8]'
            }`}
          >
            <LibraryBig className="w-4 h-4 text-[#2563eb]" />
            <span>MOVE UP</span>
          </Link>

          <Link
            to="/create/enhanced"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/create/enhanced')
                ? 'bg-[#fff7ed] text-[#ea580c] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#ea580c]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#f97316]" />
            <span>Bài dạy tăng cường</span>
          </Link>

          <Link
            to="/create/custom"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/create/custom')
                ? 'bg-[#fff1f2] text-[#e11d48] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#e11d48]'
            }`}
          >
            <FilePenLine className="w-4 h-4 text-[#f43f5e]" />
            <span>Custom Lesson Plan</span>
          </Link>
        </div>

        {/* CURRICULUM & RESOURCES GROUP */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-4 mb-2">
            Curriculum & Resources
          </p>

          <Link
            to="/curriculum-sources"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/curriculum-sources')
                ? 'bg-[#e6f7f5] text-[#0d9488] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
            }`}
          >
            <Database className="w-4 h-4 text-[#0d9488]" />
            <span>Curriculum Sources</span>
          </Link>

          <Link
            to="/my-plans"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/my-plans')
                ? 'bg-[#e6f7f5] text-[#0d9488] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#0d9488]" />
            <span>My Lesson Plans</span>
          </Link>

          <Link
            to="/teaching-resources"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/teaching-resources')
                ? 'bg-[#e6f7f5] text-[#0d9488] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-[#0d9488]" />
            <span>Teaching Resources</span>
          </Link>
        </div>

        {/* SETTINGS GROUP */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-4 mb-2">
            Settings
          </p>

          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all ${
              isActive('/settings')
                ? 'bg-[#e6f7f5] text-[#0d9488] font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-[#0d9488]'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-slate-500" />
            <span>Settings</span>
          </Link>
        </div>

      </div>

      {/* Sidebar Footer Illustration & Note */}
      <div className="pt-6 border-t border-[#e2f1f0] text-center space-y-2">
        <div className="relative w-full h-20 rounded-2xl overflow-hidden shadow-inner">
          <img
            src="/images/bottom_quote_banner.jpg"
            alt="Tulip illustration"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent flex items-end justify-center pb-1">
            <p className="text-[11px] font-serif italic text-pink-600 font-bold flex items-center space-x-1">
              <span>Better Teachers, Brighter Futures</span>
              <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
