import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { GradeSelector } from '../components/GradeSelector';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import type { LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

import { generateStructuredLessonPlan } from '../utils/lessonGenerator';
import { findTeacherChannelVideo } from '../utils/videoMatcher';

export const EnhancedLessons: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<number>(3);
  const [lessonType, setLessonType] = useState('Speaking Practice');
  const [topic, setTopic] = useState('My Hobbies & Free Time');

  const [vocabulary, setVocabulary] = useState('reading, singing, dancing, playing football');
  const [sentencePatterns, setSentencePatterns] = useState('What do you like doing? - I like reading.');
  const [teacherInstructions, setTeacherInstructions] = useState('Focus on pair speaking and communication games.');
  
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  const lessonTypes = [
    'Reinforcement (Củng cố)',
    'Revision (Ôn tập)',
    'Speaking Practice (Luyện nói)',
    'Vocabulary Consolidation (Khắc sâu từ vựng)',
    'Phonics Practice (Luyện ngữ âm)',
    'Listening Practice (Luyện nghe)',
    'Reading Practice (Luyện đọc)',
    'Writing Practice (Luyện viết)',
    'Project-based Activities (Dự án học tập)',
    'Theme-based Lessons (Bài học theo chủ đề)',
    'School-specific Enhanced Lessons (Bài dạy tăng cường nhà trường)'
  ];

  const handleGenerate = async () => {
    const vocabList = vocabulary.split(',').map(v => v.trim()).filter(Boolean);
    const patternList = sentencePatterns.split(';').map(p => p.trim()).filter(Boolean);

    const allowExternal = profile?.allow_external_youtube ?? (localStorage.getItem('allow_external_youtube') === 'true');
    const youtubeUrl = profile?.youtube_channel_url || localStorage.getItem('teacher_youtube_url') || '';
    const matchedVideo = await findTeacherChannelVideo({
      teacherId: user?.id,
      youtubeChannelUrl: youtubeUrl,
      allowExternalYoutube: allowExternal,
      gradeLevel: selectedGrade,
      topic,
      lessonTitle: topic || lessonType,
      vocabulary: vocabList
    });

    const newPlan = generateStructuredLessonPlan({
      programCode: 'ENHANCED',
      gradeLevel: selectedGrade,
      unitTitle: `Bài Dạy Tăng Cường: ${lessonType}`,
      lessonTitle: topic || lessonType,
      vocabulary: vocabList.length > 0 ? vocabList : ['speaking', 'listening', 'reading', 'vocabulary'],
      sentencePatterns: patternList.length > 0 ? patternList : ['What do you like doing? - I like...'],
      teacherInstructions,
      youtubeChannelUrl: youtubeUrl,
      matchedVideoTitle: matchedVideo?.title,
      matchedVideoUrl: matchedVideo?.url,
      matchedVideoSource: matchedVideo?.source
    });

    if (user?.id) newPlan.teacher_id = user.id;

    setGeneratedPlan(newPlan);
  };

  const handleSavePlan = async (planToSave: LessonPlan) => {
    if (!supabase || !user) return;
    const { error } = await supabase.from('lesson_plans').insert([planToSave]);
    if (error) {
      alert('Failed to save enhanced lesson plan: ' + error.message);
    } else {
      alert('Enhanced lesson plan saved successfully!');
    }
  };

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto mb-4">
          <button
            onClick={() => setGeneratedPlan(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Enhanced Setup</span>
          </button>
        </div>
        <LessonPlanEditor plan={generatedPlan} onSave={handleSavePlan} />
      </div>
    );
  }

  return (
    <div className="w-full text-slate-100 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shrink-0">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">BÀI DẠY TĂNG CƯỜNG</h1>
            <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Enhanced English Lessons • Teacher Designed
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-xl space-y-6">
          <GradeSelector selectedGrade={selectedGrade} onSelectGrade={setSelectedGrade} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Lesson Type (Loại Bài Dạy)
              </label>
              <select
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                {lessonTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Topic / Subject (Chủ Đề)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. My Hobbies, Animals, Food and Drink"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Vocabulary (Comma separated)
              </label>
              <input
                type="text"
                value={vocabulary}
                onChange={(e) => setVocabulary(e.target.value)}
                placeholder="reading, singing, dancing, playing football"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Sentence Patterns (Semicolon separated)
              </label>
              <input
                type="text"
                value={sentencePatterns}
                onChange={(e) => setSentencePatterns(e.target.value)}
                placeholder="What do you like doing? - I like reading."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <TeacherInstructions
            value={teacherInstructions}
            onChange={setTeacherInstructions}
          />

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>GENERATE ENHANCED LESSON PLAN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
