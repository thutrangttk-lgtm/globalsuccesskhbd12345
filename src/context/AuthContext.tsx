import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signInAsOwner: () => Promise<{ error: any; data?: any }>;
  loginWithUsernamePassword: (username: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTeacherOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback default teacher profile
        setProfile({
          id: userId,
          full_name: 'TRAN THI THU TRANG',
          email: user?.email || 'thutrang.ttk@gmail.com',
          role: 'teacher',
          school_name: 'TRANG TAN KHUONG PRIMARY SCHOOL'
        });
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    const ownerSessionStr = localStorage.getItem('gs_owner_session');
    if (ownerSessionStr) {
      try {
        const stored = JSON.parse(ownerSessionStr);
        if (stored?.user && stored?.profile) {
          setUser(stored.user);
          setProfile(stored.profile);
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('gs_owner_session');
      }
    }

    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!ownerSessionStr) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        const currentOwner = localStorage.getItem('gs_owner_session');
        if (!currentOwner) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signInAsOwner = async () => {
    return loginWithUsernamePassword('THUTRANG', '12345Trang?');
  };

  const loginWithUsernamePassword = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/owner-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { error: new Error('Incorrect username or password.') };
      }

      if (result.access_token && result.refresh_token && supabase) {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token
        });
      }

      const ownerUser = result.user || {
        id: 'ce712595-0ab7-4aa1-b2bb-ff52136331f2',
        email: 'thutrang.ttk@gmail.com',
        user_metadata: { full_name: 'TRAN THI THU TRANG', role: 'teacher' }
      };

      const ownerProfile: Profile = {
        id: ownerUser.id,
        full_name: 'TRAN THI THU TRANG',
        email: 'thutrang.ttk@gmail.com',
        role: 'teacher',
        school_name: 'TRANG TAN KHUONG PRIMARY SCHOOL'
      };

      setUser(ownerUser as User);
      setProfile(ownerProfile);
      localStorage.setItem('gs_owner_session', JSON.stringify({ user: ownerUser, profile: ownerProfile }));

      return { data: { user: ownerUser, profile: ownerProfile }, error: null };
    } catch (apiErr: any) {
      return { error: new Error('Incorrect username or password.') };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('gs_owner_session');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';
  const isTeacherOrAdmin = profile ? (profile.role === 'teacher' || profile.role === 'admin') : true;

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signInWithPassword, signInAsOwner, loginWithUsernamePassword, signOut, isAdmin, isTeacherOrAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
