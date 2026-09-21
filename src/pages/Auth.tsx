import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signInWithPassword, signInAsOwner } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleOwnerClick = async () => {
    setOwnerLoading(true);
    setMessage(null);

    const { error } = await signInAsOwner();
    setOwnerLoading(false);

    if (error) {
      console.error('Owner Sign-In Error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to authenticate owner session with Supabase Auth.'
      });
    } else {
      navigate('/');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (email.trim().toLowerCase() === 'thutrang.ttk@gmail.com') {
      setMessage({
        type: 'error',
        text: 'thutrang.ttk@gmail.com is the trusted owner account. Please click the TRUSTED OWNER ACCESS (1-CLICK) button above for passwordless sign-in.'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await signInWithPassword(email.trim(), password);
    setLoading(false);

    if (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to sign in. Please check your email and password.'
      });
    } else {
      navigate('/');
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (email.trim().toLowerCase() === 'thutrang.ttk@gmail.com') {
      setMessage({
        type: 'error',
        text: 'thutrang.ttk@gmail.com is the trusted owner account. Please click the TRUSTED OWNER ACCESS (1-CLICK) button above for passwordless owner access.'
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await signIn(email.trim());
    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to send login link.' });
    } else {
      setMessage({
        type: 'success',
        text: 'Login link sent! Please check your email inbox to sign in.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white">LESSON PLAN STUDIO</h1>
          <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mt-1">
            Global Success • Primary English Education
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-start space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* TRUSTED OWNER ACCESS CARD - 100% PASSWORDLESS */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                TRUSTED OWNER ACCESS
              </h2>
              <p className="text-[11px] text-slate-300 font-mono">thutrang.ttk@gmail.com</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Direct Passwordless 1-Click Access for application owner. Authenticates a valid Supabase Auth session with full RLS permissions.
          </p>

          <button
            type="button"
            onClick={handleOwnerClick}
            disabled={ownerLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{ownerLoading ? 'Authenticating Owner Session...' : 'TRUSTED OWNER ACCESS (1-CLICK)'}</span>
          </button>
        </div>

        {/* DIVIDER */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
            OR REGULAR TEACHER LOGIN
          </span>
        </div>

        {/* Authentication Mode Tabs for General Accounts */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'password'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password Sign-In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'otp'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Magic Link / OTP
          </button>
        </div>

        {/* REGULAR TEACHER LOGIN FORM */}
        <form onSubmit={authMode === 'password' ? handlePasswordLogin : handleOtpLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Teacher Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trang.tran@primary.edu.vn"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {authMode === 'password' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-blue-400" />
            <span>
              {loading
                ? 'Authenticating...'
                : authMode === 'password'
                ? 'Sign In with Password'
                : 'Send Magic Link / OTP'}
            </span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          Trang Tan Khuong Primary School • Hiep Phuoc Commune
        </div>

      </div>
    </div>
  );
};

export default Auth;
