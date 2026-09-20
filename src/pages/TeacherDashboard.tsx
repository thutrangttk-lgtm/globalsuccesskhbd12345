import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LibraryBig, 
  Sparkles, 
  FilePenLine, 
  Heart, 
  Lightbulb 
} from 'lucide-react';
import { ProgramCard } from '../components/ProgramCard';
import { useAuth } from '../context/AuthContext';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner matching screenshot */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#e6f7f5] via-[#edf9f8] to-[#fff3f5] border border-[#d5f0ec] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center space-x-1.5 text-[#0d9488] text-sm font-bold font-serif italic">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Hello, Teacher!</span>
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#0f766e] tracking-tight">
            Welcome, {profile?.full_name?.toUpperCase() || 'TRAN THI THU TRANG'}
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {profile?.school_name || 'Trang Tấn Khương Primary School'} - Hiệp Phước Commune. Select a creation mode below to build verified, CV 2345-compliant lesson plans for Grades 1–5.
          </p>

          <div className="pt-2 flex items-center space-x-2">
            <span className="text-sm font-serif italic font-bold text-pink-500">
              Small steps &rarr; Big progress
            </span>
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
          </div>
        </div>

        {/* Right 3D Illustration Graphic */}
        <div className="w-72 h-40 relative rounded-2xl overflow-hidden shadow-md border border-white/80 shrink-0">
          <img
            src="/images/dashboard_main_hero.jpg"
            alt="English is fun illustration"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

      {/* LESSON PLAN CREATION MODES */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <BookOpen className="w-4 h-4 text-[#0f766e]" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#0f766e]">
            LESSON PLAN CREATION MODES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. GLOBAL SUCCESS */}
          <ProgramCard
            title="GLOBAL SUCCESS"
            subtitle="OFFICIAL TEXTBOOK SERIES"
            description="Standard lesson plans for Global Success English Grades 1, 2, 3, 4, and 5 based on verified source materials."
            icon={BookOpen}
            badge="Grades 1–5"
            theme="teal"
            illustrationUrl="/images/curriculum_banner.jpg"
            onClick={() => navigate('/create/global-success')}
          />

          {/* 2. MOVE UP */}
          <ProgramCard
            title="MOVE UP"
            subtitle="ENHANCED CURRICULUM"
            description="Dedicated MOVE UP lesson planning with independent unit structures, vocabulary, and learning outcomes."
            icon={LibraryBig}
            badge="Level 1–5"
            theme="blue"
            illustrationUrl="/images/dashboard_main_hero.jpg"
            onClick={() => navigate('/create/move-up')}
          />

          {/* 3. BÀI DẠY TĂNG CƯỜNG */}
          <ProgramCard
            title="BÀI DẠY TĂNG CƯỜNG"
            subtitle="ENHANCED LESSONS"
            description="Supplementary English lessons for Reinforcement, Revision, Speaking practice, Phonics, and Theme-based topics."
            icon={Sparkles}
            badge="Enhanced"
            theme="orange"
            illustrationUrl="/images/bottom_quote_banner.jpg"
            onClick={() => navigate('/create/enhanced')}
          />

          {/* 4. CUSTOM LESSON PLAN */}
          <ProgramCard
            title="CUSTOM LESSON PLAN"
            subtitle="TẠO KHBD THEO THÔNG TIN NHẬP"
            description="Generate custom lesson plans from manual inputs, pasted lesson text, or textbook screenshots (OCR & OCR analysis)."
            icon={FilePenLine}
            badge="Text / Image"
            theme="pink"
            illustrationUrl="/images/lesson_plan_header.jpg"
            onClick={() => navigate('/create/custom')}
          />

        </div>
      </div>

      {/* Bottom Quote Banner */}
      <div className="bg-white border border-[#e2f1f0] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <p className="text-base font-serif italic text-teal-800 font-bold">
            &ldquo;Good planning today creates confident learners tomorrow.&rdquo;
            <span className="text-pink-500 font-normal ml-1.5">♡</span>
          </p>
        </div>

        <div className="w-48 h-16 relative rounded-2xl overflow-hidden shadow-xs shrink-0 hidden sm:block">
          <img
            src="/images/bottom_quote_banner.jpg"
            alt="Tulip illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  );
};
