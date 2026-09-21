import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, User, Building, CheckCircle2, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Settings: React.FC = () => {
  const { profile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || 'TRAN THI THU TRANG');
  const [schoolName, setSchoolName] = useState(profile?.school_name || 'TRANG TAN KHUONG PRIMARY SCHOOL');
  const [communeName, setCommuneName] = useState("HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE");
  const [principalName, setPrincipalName] = useState('Trương Thị Lệ Hằng');
  const [headTeacherName, setHeadTeacherName] = useState('Nguyễn Thị Ngà');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(
    localStorage.getItem('teacher_youtube_url') || ''
  );
  const [allowExternalYoutube, setAllowExternalYoutube] = useState<boolean>(
    localStorage.getItem('allow_external_youtube') === 'true'
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.school_name) setSchoolName(profile.school_name);
    if (profile?.youtube_channel_url) setYoutubeChannelUrl(profile.youtube_channel_url);
    if (profile?.allow_external_youtube !== undefined) {
      setAllowExternalYoutube(profile.allow_external_youtube);
    }
  }, [profile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    localStorage.setItem('teacher_youtube_url', youtubeChannelUrl.trim());
    localStorage.setItem('allow_external_youtube', String(allowExternalYoutube));

    if (supabase && profile?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            full_name: fullName, 
            school_name: schoolName,
            youtube_channel_url: youtubeChannelUrl.trim()
          })
          .eq('id', profile.id);
      } catch (err) {
        console.warn('Profile save warning:', err);
      }
    }

    setSaving(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="p-2.5 sm:p-3 bg-white border border-[#e0f0ee] text-[#0d9488] rounded-2xl shadow-xs shrink-0">
          <SettingsIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0f766e] tracking-wide">SETTINGS & PREFERENCES</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Teacher Profile, Teaching Resource Preferences & Header Options
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings and preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white border border-[#e0f0ee] rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
        
        <h3 className="text-base font-bold text-[#0f766e] border-b border-[#e2f1f0] pb-3 flex items-center space-x-2">
          <User className="w-4 h-4 text-[#0d9488]" />
          <span>Teacher Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Teacher Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Primary School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* TEACHING RESOURCE PREFERENCES */}
        <h3 className="text-base font-bold text-[#0f766e] border-b border-[#e2f1f0] pb-3 flex items-center space-x-2 pt-2">
          <Video className="w-4 h-4 text-red-500" />
          <span>TEACHING RESOURCE PREFERENCES</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            Teacher's YouTube Channel URL
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Save the exact URL of your YouTube channel to search/reference your own teaching videos in Warm-up activities.
          </p>
          <input
            type="url"
            value={youtubeChannelUrl}
            onChange={(e) => setYoutubeChannelUrl(e.target.value)}
            placeholder="e.g. https://www.youtube.com/@MsTrangPrimaryEnglish"
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 mb-4"
          />

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 cursor-pointer">
                <span>Allow external YouTube resources</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${allowExternalYoutube ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
                  {allowExternalYoutube ? 'ON' : 'OFF (DEFAULT)'}
                </span>
              </label>
              <p className="text-[11px] text-slate-500">
                When OFF, system ONLY uses your saved YouTube channel or non-YouTube Warm-ups. When ON, system may suggest safe educational external YouTube videos if your channel has no match.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAllowExternalYoutube(!allowExternalYoutube)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allowExternalYoutube ? 'bg-teal-600' : 'bg-slate-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${allowExternalYoutube ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* INSTITUTIONAL HEADER */}
        <h3 className="text-base font-bold text-[#0f766e] border-b border-[#e2f1f0] pb-3 flex items-center space-x-2 pt-2">
          <Building className="w-4 h-4 text-blue-600" />
          <span>Fixed Institutional Header & Signatures</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Commune People's Committee Name (English)
          </label>
          <input
            type="text"
            value={communeName}
            onChange={(e) => setCommuneName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              BAN GIÁM HIỆU Signature Name
            </label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              TỔ TRƯỜNG Signature Name
            </label>
            <input
              type="text"
              value={headTeacherName}
              onChange={(e) => setHeadTeacherName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#e2f1f0] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
