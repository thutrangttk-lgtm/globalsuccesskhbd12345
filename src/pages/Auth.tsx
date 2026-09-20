import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signInWithPassword } = useAuth();

  const [email, setEmail] = useState('thutrang.ttk@gmail.com');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isTrustedAccount = email.trim().toLowerCase() === 'thutrang.ttk@gmail.com';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage(null);

    const { error } = await signInWithPassword(email.trim(), password);
    setLoading(false);

    if (error) {
      console.error('Login error:', error);
      if (isTrustedAccount && (error.message?.includes('Email not confirmed') || error.status === 400)) {
        setMessage({
          type: 'error',
          text: error.message || 'Supabase password authentication failed. Please verify account credentials in Supabase.'
        });
      } else {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to sign in. Please check your email and password.'
        });
      }
    } else {
      navigate('/');
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

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
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wide text-white">LESSON PLAN STUDIO</h1>
          <p className="text-xs font-semibold text-blue-400 tracking-widest uppercase mt-1">
            Global Success • Primary English Education
          </p>
        </div>

        {/* Trusted Account Badge */}
        {isTrustedAccount ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 mb-6 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <p className="font-bold text-emerald-300">Trusted Teacher Account</p>
              Direct password login enabled. No OTP or magic link email required.
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 mb-6 leading-relaxed">
            <p className="font-semibold text-white mb-1">Teacher & Admin Portal</p>
            This application is designed exclusively for Primary School English Teachers (Grades 1–5).
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-start space-x-2 ${
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

        {/* Authentication Mode Tabs for General Accounts */}
        {!isTrustedAccount && (
          <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'password'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'otp'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Magic Link / OTP
            </button>
          </div>
        )}

        <form onSubmit={isTrustedAccount || authMode === 'password' ? handlePasswordLogin : handleOtpLogin} className="space-y-4">
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
                placeholder="thutrang.ttk@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {(isTrustedAccount || authMode === 'password') && (
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {loading
                ? 'Authenticating...'
                : isTrustedAccount || authMode === 'password'
                ? 'Sign In with Password'
                : 'Send Magic Link / OTP'}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          Trang Tan Khuong Primary School • Hiep Phuoc Commune
        </div>

      </div>
    </div>
  );
};

export default Auth;
