import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Database, 
  FolderArchive, 
  Home, 
  Bell, 
  Settings as SettingsIcon, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-[#e0f0ee] h-16 px-6 flex items-center justify-between shadow-xs shrink-0">
      
      {/* Quick Top Navigation Pills */}
      <nav className="flex items-center space-x-2">
        <Link
          to="/"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isActive('/')
              ? 'bg-[#ccfbf1] text-[#0f766e] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f766e]'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-[#0d9488]" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/my-plans"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isActive('/my-plans')
              ? 'bg-[#ccfbf1] text-[#0f766e] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f766e]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
          <span>My Lesson Plans</span>
        </Link>

        <Link
          to="/curriculum-sources"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isActive('/curriculum-sources')
              ? 'bg-[#ccfbf1] text-[#0f766e] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f766e]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#0d9488]" />
          <span>Curriculum Sources</span>
        </Link>

        <Link
          to="/teaching-resources"
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            isActive('/teaching-resources')
              ? 'bg-[#ccfbf1] text-[#0f766e] shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f766e]'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5 text-[#0d9488]" />
          <span>Teaching Resources</span>
        </Link>
      </nav>

      {/* Right User Header Profile & Quick Actions */}
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {profile?.school_name || 'TRANG TẤN KHƯƠNG PRIMARY SCHOOL'}
          </p>
          <p className="text-sm font-extrabold text-slate-800">
            {profile?.full_name || 'Trần Thị Thu Trang'}
          </p>
        </div>

        {/* Teacher Avatar */}
        <div className="relative w-9 h-9 rounded-full bg-teal-100 border-2 border-teal-500 overflow-hidden flex items-center justify-center shadow-xs">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop"
            alt="Teacher Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* Settings Button */}
        <Link
          to="/settings"
          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};
