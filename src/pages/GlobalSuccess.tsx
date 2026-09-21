import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowLeft } from 'lucide-react';
import { GradeSelector } from '../components/GradeSelector';
import { UnitSelector } from '../components/UnitSelector';
import { LessonSelector } from '../components/LessonSelector';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import { EmptyState } from '../components/EmptyState';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CurriculumUnit, Lesson, LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { generateStructuredLessonPlan } from '../utils/lessonGenerator';
import { findTeacherChannelVideo } from '../utils/videoMatcher';

export const GlobalSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState<number>(3);
  const [units, setUnits] = useState<CurriculumUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [teacherInstructions, setTeacherInstructions] = useState('');

  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    async function fetchUnits() {
      setLoadingUnits(true);
      setSelectedUnitId(null);
      setSelectedLessonId(null);
      setLessons([]);

      if (!supabase || !isSupabaseConfigured) {
        setLoadingUnits(false);
        return;
      }

      try {
        const { data: programData } = await supabase
          .from('teaching_programs')
          .select('id')
          .eq('code', 'GLOBAL_SUCCESS')
          .maybeSingle();

        if (programData) {
          const { data, error } = await supabase
            .from('curriculum_units')
            .select('*')
            .eq('teaching_program_id', programData.id)
            .eq('grade_level', selectedGrade)
            .order('unit_number', { ascending: true });

          if (error) console.error('Error fetching units:', error);
          setUnits(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUnits(false);
      }
    }

    fetchUnits();
  }, [selectedGrade]);

  useEffect(() => {
    async function fetchLessons() {
      if (!selectedUnitId) return;
      setLoadingLessons(true);
      setSelectedLessonId(null);

      if (!supabase || !isSupabaseConfigured) {
        setLoadingLessons(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('unit_id', selectedUnitId)
          .order('lesson_number', { ascending: true });

        if (error) console.error('Error fetching lessons:', error);
        setLessons(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLessons(false);
      }
    }

    fetchLessons();
  }, [selectedUnitId]);

  const handleGenerate = async () => {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    const selectedLesson = lessons.find(l => l.id === selectedLessonId);

    let vocab: string[] = ['hello', 'hi', 'goodbye', 'friend'];
    let patterns: string[] = ['How are you? - I am fine, thank you.'];

    if (supabase && selectedLessonId) {
      try {
        const { data: content } = await supabase
          .from('lesson_content')
          .select('*')
          .eq('lesson_id', selectedLessonId)
          .maybeSingle();

        if (content) {
          if (Array.isArray(content.vocabulary) && content.vocabulary.length > 0) {
            vocab = content.vocabulary;
          }
          if (Array.isArray(content.sentence_patterns) && content.sentence_patterns.length > 0) {
            patterns = content.sentence_patterns;
          }
        }
      } catch (err) {
        console.warn('Could not fetch lesson_content:', err);
      }
    }

    // Fetch verified integration standards for Grade
    let integrations: { type: any; officialCode: string; officialWording: string; domain?: string }[] = [
      {
        type: 'NLS',
        officialCode: `NLS_${selectedGrade}.1.2`,
        officialWording: 'Pupils select and use teacher-approved digital resources during lesson practice.',
        domain: 'Domain 1: Digital Media & Learning'
      }
    ];

    if (supabase) {
      try {
        const { data: reqs } = await supabase
          .from('integration_requirements')
          .select('*')
          .eq('grade_level', selectedGrade)
          .eq('verification_status', 'VERIFIED')
          .limit(2);

        if (reqs && reqs.length > 0) {
          integrations = reqs.map(r => ({
            type: r.integration_type as any,
            officialCode: r.official_code,
            officialWording: r.official_wording,
            domain: r.domain || undefined
          }));
        }
      } catch (err) {
        console.warn('Could not fetch integration_requirements:', err);
      }
    }

    const allowExternal = profile?.allow_external_youtube ?? (localStorage.getItem('allow_external_youtube') === 'true');
    const youtubeUrl = profile?.youtube_channel_url || localStorage.getItem('teacher_youtube_url') || '';
    const matchedVideo = await findTeacherChannelVideo({
      teacherId: user?.id,
      youtubeChannelUrl: youtubeUrl,
      allowExternalYoutube: allowExternal,
      gradeLevel: selectedGrade,
      unitNumber: selectedUnit?.unit_number,
      unitTitle: selectedUnit?.title,
      topic: selectedUnit?.topic,
      lessonTitle: selectedLesson?.title,
      vocabulary: vocab
    });

    const newPlan = generateStructuredLessonPlan({
      programCode: 'GLOBAL_SUCCESS',
      gradeLevel: selectedGrade,
      unitNumber: selectedUnit?.unit_number || 1,
      unitTitle: selectedUnit ? `UNIT ${selectedUnit.unit_number}: ${selectedUnit.title.toUpperCase()}` : `UNIT 1`,
      lessonNumber: selectedLesson?.lesson_number || 1,
      lessonTitle: selectedLesson ? `LESSON ${selectedLesson.lesson_number}` : 'LESSON 1',
      vocabulary: vocab,
      sentencePatterns: patterns,
      teacherInstructions,
      availableIntegrations: integrations,
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
      console.error('Error saving plan:', error);
      alert('Failed to save lesson plan to database: ' + error.message);
    } else {
      alert('Lesson plan saved successfully!');
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
            <span>Back to Unit Selection</span>
          </button>
        </div>
        <LessonPlanEditor plan={generatedPlan} onSave={handleSavePlan} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="relative overflow-hidden bg-gradient-to-r from-[#e6f7f5] via-[#edf9f8] to-[#fff3f5] border border-[#d5f0ec] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-[#0d9488] rounded-2xl text-white shadow-md shadow-teal-700/20 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#ccfbf1] text-[#0f766e] border border-teal-300 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold mb-1">
              <span>Official Primary English Series</span>
            </div>
            <h1 className="text-2xl font-black text-[#0f766e] tracking-wide">GLOBAL SUCCESS</h1>
            <p className="text-xs text-slate-600 max-w-md">
              Official Primary English textbook series by Vietnam Education Publishing House (Grades 1–5).
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-48 h-28 relative rounded-2xl overflow-hidden shadow-xs border border-white shrink-0">
          <img
            src="/images/curriculum_banner.jpg"
            alt="English textbooks illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-white border border-[#e0f0ee] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <GradeSelector selectedGrade={selectedGrade} onSelectGrade={setSelectedGrade} />

          {units.length === 0 && !loadingUnits ? (
            <EmptyState
              title="CURRICULUM DATA HAS NOT BEEN IMPORTED YET."
              message={`No verified Global Success curriculum data found for Grade ${selectedGrade} in Supabase.`}
              actionText="Create Custom Lesson Plan Instead"
              onAction={() => navigate('/create/custom')}
            />
          ) : (
            <>
              <UnitSelector
                units={units}
                selectedUnitId={selectedUnitId}
                onSelectUnit={setSelectedUnitId}
                loading={loadingUnits}
              />

              {selectedUnitId && (
                <LessonSelector
                  lessons={lessons}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={setSelectedLessonId}
                  loading={loadingLessons}
                />
              )}

              <TeacherInstructions
                value={teacherInstructions}
                onChange={setTeacherInstructions}
              />

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE LESSON PLAN</span>
                </button>
              </div>
            </>
          )}
        </div>

    </div>
  );
};
