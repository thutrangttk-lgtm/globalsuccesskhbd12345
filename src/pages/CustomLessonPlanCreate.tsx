import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePenLine, Sparkles, ArrowLeft } from 'lucide-react';
import { CustomLessonForm } from '../components/CustomLessonForm';
import { LessonTextInput } from '../components/LessonTextInput';
import { LessonImageUploader } from '../components/LessonImageUploader';
import { ExtractedContentReview } from '../components/ExtractedContentReview';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import type { ExtractedLessonInfo, LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const CustomLessonPlanCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'form' | 'paste' | 'image' | 'mixed'>('mixed');

  const [lessonInfo, setLessonInfo] = useState<ExtractedLessonInfo>({
    gradeLevel: 3,
    unitTitle: 'Unit 1: Hello & Greetings',
    lessonTitle: 'Lesson 1 - Look, listen and repeat',
    vocabulary: ['hello', 'hi', 'goodbye', 'friend'],
    sentencePatterns: ['How are you? - I am fine, thank you.', 'What is your name? - My name is...'],
    skills: ['Listening', 'Speaking'],
    activities: [
      'Activity 1: Look, listen and repeat.',
      'Activity 2: Listen, point and say.',
      "Activity 3: Let's talk in pairs."
    ]
  });

  const [teacherInstructions, setTeacherInstructions] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  const handleExtracted = (extracted: ExtractedLessonInfo) => {
    setLessonInfo((prev) => ({
      ...prev,
      gradeLevel: extracted.gradeLevel || prev.gradeLevel,
      unitTitle: extracted.unitTitle || prev.unitTitle,
      lessonTitle: extracted.lessonTitle || prev.lessonTitle,
      vocabulary: Array.from(new Set([...(prev.vocabulary || []), ...(extracted.vocabulary || [])])),
      sentencePatterns: Array.from(new Set([...(prev.sentencePatterns || []), ...(extracted.sentencePatterns || [])])),
      activities: Array.from(new Set([...(prev.activities || []), ...(extracted.activities || [])]))
    }));
  };

  const handleGenerate = () => {
    const newPlan: LessonPlan = {
      teacher_id: user?.id,
      teaching_program_code: 'CUSTOM',
      grade_level: lessonInfo.gradeLevel || 3,
      title: `Lesson Plan Grade ${lessonInfo.gradeLevel || 3} - CUSTOM LESSON PLAN`,
      unit_title: lessonInfo.unitTitle ? lessonInfo.unitTitle.toUpperCase() : 'UNIT CUSTOM',
      lesson_title: lessonInfo.lessonTitle || 'Lesson 1',
      duration_minutes: lessonInfo.durationMinutes || 35,
      vocabulary: lessonInfo.vocabulary || ['hello', 'hi'],
      sentence_patterns: lessonInfo.sentencePatterns || ['How are you?'],
      skills: lessonInfo.skills || ['Listening', 'Speaking', 'Reading', 'Writing'],
      competences_qualities_text: "Thereby contributing to the development of pupils' general competences and qualities (autonomy, communication, cooperation).",
      integrations: [],
      teaching_aids: [
        'Textbook material & teacher notes',
        'Audio & flashcards',
        'Interactive whiteboard / Projector'
      ],
      procedures: (lessonInfo.activities || []).map((act, idx) => ({
        id: `proc_custom_${idx}`,
        stageName: `Stage ${idx + 1}: ${act.split(':')[0] || 'Activity'}`,
        teacherActivities: [
          `Teacher introduces ${act}.`,
          'Teacher gives clear instructions and models.'
        ],
        pupilActivities: [
          `Pupils participate in ${act}.`,
          'Pupils practise in pairs/groups.'
        ],
        expectedOutcome: 'Pupils perform target language task accurately.',
        evidence: 'Pupils pronounce words correctly and complete activity.',
        postLessonAdjustments: '' // BLANK
      })),
      post_reflection: 'The custom lesson plan was created successfully from teacher-provided inputs and executed smoothly.'
    };

    setGeneratedPlan(newPlan);
  };

  const handleSavePlan = async (planToSave: LessonPlan) => {
    if (!supabase || !user) return;
    const { error } = await supabase.from('lesson_plans').insert([planToSave]);
    if (error) {
      alert('Failed to save custom plan: ' + error.message);
    } else {
      alert('Custom lesson plan saved successfully!');
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
            <span>Back to Custom Setup</span>
          </button>
        </div>
        <LessonPlanEditor plan={generatedPlan} onSave={handleSavePlan} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg">
            <FilePenLine className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">TẠO KHBD THEO THÔNG TIN NHẬP</h1>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Custom Lesson Plan • Text, Image & Mixed Input
            </p>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('mixed')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'mixed'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Mixed Input (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'form'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Manual Form Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'paste'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Paste Text Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'image'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Upload Images Only
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {(activeTab === 'paste' || activeTab === 'mixed') && (
            <LessonTextInput onExtracted={handleExtracted} />
          )}

          {(activeTab === 'image' || activeTab === 'mixed') && (
            <LessonImageUploader onImagesExtracted={handleExtracted} />
          )}

          {(activeTab === 'form' || activeTab === 'mixed') && (
            <CustomLessonForm formData={lessonInfo} onChange={setLessonInfo} />
          )}

          <ExtractedContentReview info={lessonInfo} onChange={setLessonInfo} />

          <TeacherInstructions
            value={teacherInstructions}
            onChange={setTeacherInstructions}
          />

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleGenerate}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-amber-600/20 flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>GENERATE CUSTOM LESSON PLAN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
