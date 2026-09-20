import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, User, FileText, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide text-white">LESSON PLAN</span>
            <span className="text-xs block text-blue-400 font-semibold tracking-wider">GLOBAL SUCCESS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/my-plans"
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1.5 transition-colors ${
              isActive('/my-plans') ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Lesson Plans</span>
          </Link>

          <Link
            to="/curriculum-sources"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/curriculum-sources') ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Curriculum Sources
          </Link>

          <Link
            to="/teaching-resources"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/teaching-resources') ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Teaching Resources
          </Link>

          {isAdmin && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </span>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {profile ? (
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-100">{profile.full_name}</p>
                <p className="text-xs text-slate-400">{profile.school_name}</p>
              </div>

              <Link
                to="/settings"
                title="Settings"
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
