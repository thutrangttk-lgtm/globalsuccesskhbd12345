import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LibraryBig, Sparkles, FilePenLine, FileText, Database, FolderArchive, Settings as SettingsIcon } from 'lucide-react';
import { ProgramCard } from '../components/ProgramCard';
import { useAuth } from '../context/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>Primary English Education Studio</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">
              Welcome, {profile?.full_name || 'Teacher Tran Thi Thu Trang'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Trang Tan Khuong Primary School • Hiep Phuoc Commune. Select a creation mode below to build verified, CV 2345-compliant lesson plans for Grades 1–5.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/my-plans')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>My Saved Plans</span>
            </button>
          </div>
        </div>

        {/* FOUR MAJOR CREATION CARDS */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
            Lesson Plan Creation Modes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. GLOBAL SUCCESS */}
            <ProgramCard
              title="GLOBAL SUCCESS"
              subtitle="Official Textbook Series"
              description="Standard lesson plans for Global Success English Grades 1, 2, 3, 4, and 5 based on verified source materials."
              icon={BookOpen}
              badge="Grades 1–5"
              colorClass="bg-blue-600"
              onClick={() => navigate('/create/global-success')}
            />

            {/* 2. MOVE UP */}
            <ProgramCard
              title="MOVE UP"
              subtitle="Enhanced Curriculum"
              description="Dedicated MOVE UP lesson planning with independent unit structures, vocabulary, and learning outcomes."
              icon={LibraryBig}
              badge="Level 1–5"
              colorClass="bg-indigo-600"
              onClick={() => navigate('/create/move-up')}
            />

            {/* 3. BÀI DẠY TĂNG CƯỜNG */}
            <ProgramCard
              title="BÀI DẠY TĂNG CƯỜNG"
              subtitle="Enhanced Lessons"
              description="Supplementary English lessons for Reinforcement, Revision, Speaking practice, Phonics, and Theme-based topics."
              icon={Sparkles}
              badge="Enhanced"
              colorClass="bg-emerald-600"
              onClick={() => navigate('/create/enhanced')}
            />

            {/* 4. TẠO KHBD THEO THÔNG TIN NHẬP / CUSTOM LESSON PLAN */}
            <ProgramCard
              title="CUSTOM LESSON PLAN"
              subtitle="Tạo KHBD Theo Thông Tin Nhập"
              description="Generate custom lesson plans from manual inputs, pasted lesson text, or textbook screenshots (OCR & OCR analysis)."
              icon={FilePenLine}
              badge="Text / Image"
              colorClass="bg-amber-600"
              onClick={() => navigate('/create/custom')}
            />

          </div>
        </div>

        {/* SECONDARY FUNCTIONS */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">
            Secondary Management Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <button
              onClick={() => navigate('/my-plans')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all hover:bg-slate-800/80 group flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">MY LESSON PLANS</h4>
                <p className="text-xs text-slate-400">View & export saved plans</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/curriculum-sources')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all hover:bg-slate-800/80 group flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">CURRICULUM SOURCES</h4>
                <p className="text-xs text-slate-400">Official standards & NLS/AI codes</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/teaching-resources')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all hover:bg-slate-800/80 group flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">TEACHING RESOURCES</h4>
                <p className="text-xs text-slate-400">Flashcards, audio & materials</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all hover:bg-slate-800/80 group flex items-center space-x-4"
            >
              <div className="p-3 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">SETTINGS</h4>
                <p className="text-xs text-slate-400">Teacher profile & school info</p>
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
