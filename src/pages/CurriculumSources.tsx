import React from 'react';
import { Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export const CurriculumSources: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">CURRICULUM SOURCES & STANDARDS</h1>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Legal Framework • Công Văn 2345 • NLS (Thông tư 02) • AI (Quyết định 2422)
            </p>
          </div>
        </div>

        {/* Legal & Curriculum Basis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Vietnam Education Curriculum 2018 (CTGDPT 2018)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Primary English curriculum for Grades 1–5 establishing target communicative competencies and language knowledge.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Công Văn 2345/BGDĐT-GDTH</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official guidelines on primary school lesson planning structure (Objectives, Teaching Aids, 3-Column Procedures, Post-Reflection).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Thông Tư 02/2025/TT-BGDĐT (NLS)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Digital Competence Framework for Learners (Khung năng lực số cho người học). Requires observable pupil actions and official code preservation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-amber-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Quyết Định 2422/QĐ-BGDĐT (AI Education)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI Education Framework. Teacher use of AI tools for lesson preparation does NOT automatically count as pupil AI competence.
            </p>
          </div>

        </div>

        {/* Database Source Documents State */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Imported Source Documents Status
          </h3>
          
          <EmptyState
            title="NO VERIFIED PDF/DOCX SOURCE FILES IMPORTED"
            message="No external source document files have been uploaded to Supabase Storage yet. Verified textbook data can be managed by System Administrators."
          />
        </div>

      </div>
    </div>
  );
};
