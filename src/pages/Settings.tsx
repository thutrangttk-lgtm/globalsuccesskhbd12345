import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, User, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Settings: React.FC = () => {
  const { profile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || 'TRAN THI THU TRANG');
  const [schoolName, setSchoolName] = useState(profile?.school_name || 'TRANG TAN KHUONG PRIMARY SCHOOL');
  const [communeName, setCommuneName] = useState("HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE");
  const [principalName, setPrincipalName] = useState('Trương Thị Lệ Hằng');
  const [headTeacherName, setHeadTeacherName] = useState('Nguyễn Thị Ngà');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    if (supabase && profile?.id) {
      await supabase
        .from('profiles')
        .update({ full_name: fullName, school_name: schoolName })
        .eq('id', profile.id);
    }

    setSaving(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-800 text-slate-200 rounded-2xl shadow-lg">
            <SettingsIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">SETTINGS & INSTITUTION</h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Teacher Profile & Word Export Header Configuration
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Teacher Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Teacher Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Primary School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2 pt-2">
            <Building className="w-4 h-4 text-indigo-400" />
            <span>Fixed Institutional Header & Signatures</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Commune People's Committee Name (English)
            </label>
            <input
              type="text"
              value={communeName}
              onChange={(e) => setCommuneName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                BAN GIÁM HIỆU Signature Name
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                TỔ TRƯỜNG Signature Name
              </label>
              <input
                type="text"
                value={headTeacherName}
                onChange={(e) => setHeadTeacherName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
