import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryBig, Sparkles, ArrowLeft, CheckCircle2, BookOpen, Clock, Layers } from 'lucide-react';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import { EmptyState } from '../components/EmptyState';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MoveUpLessonMaster, LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { generateStructuredLessonPlan } from '../utils/lessonGenerator';
import { findTeacherChannelVideo } from '../utils/videoMatcher';

export const MoveUp: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [records, setRecords] = useState<MoveUpLessonMaster[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [teacherInstructions, setTeacherInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  // Optional Integration Opt-in State (Default: OFF)
  const [enableIntegration, setEnableIntegration] = useState(false);
  const [selectedIntegrationTypes, setSelectedIntegrationTypes] = useState<string[]>([]);
  const [customIntegrationWording, setCustomIntegrationWording] = useState('');

  // 1. Fetch Move Up Grade 2 records directly from public.move_up_lesson_master
  useEffect(() => {
    async function fetchMoveUpData() {
      setLoading(true);

      if (!supabase || !isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('move_up_lesson_master')
          .select('*')
          .eq('grade', 2)
          .order('week', { ascending: true });

        if (error) {
          console.error('Error fetching move_up_lesson_master:', error);
          setRecords([]);
        } else if (data) {
          const moveUpRecords: MoveUpLessonMaster[] = data;
          setRecords(moveUpRecords);
          if (moveUpRecords.length > 0) {
            setSelectedWeek(moveUpRecords[0].week);
          }
        }
      } catch (err) {
         console.error('Failed to query move_up_lesson_master:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMoveUpData();
  }, []);

  const currentRecord = records.find(r => r.week === selectedWeek);

  const handleGenerate = async () => {
    if (!currentRecord) return;

    // Language Content: Use verified Supabase data ONLY when non-null/non-empty.
    // If NULL or empty, keep as empty arrays (DO NOT invent fake content or copy from Global Success).
    const vocabList = currentRecord.vocabulary
      ? currentRecord.vocabulary.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
      : [];

    const patternList = currentRecord.sentence_patterns
      ? currentRecord.sentence_patterns.split(/[/;\n]/).map(s => s.trim()).filter(Boolean)
      : [];

    const allowExternal = profile?.allow_external_youtube ?? (localStorage.getItem('allow_external_youtube') === 'true');
    const youtubeUrl = profile?.youtube_channel_url || localStorage.getItem('teacher_youtube_url') || '';

    const matchedVideo = await findTeacherChannelVideo({
      teacherId: user?.id,
      youtubeChannelUrl: youtubeUrl,
      allowExternalYoutube: allowExternal,
      gradeLevel: 2,
      unitTitle: currentRecord.unit,
      lessonTitle: currentRecord.lesson_title,
      vocabulary: vocabList
    });

    // Handle user opt-in integrations (if user manually enabled & selected integrations)
    let availableIntegrations: any[] | undefined = undefined;
    if (enableIntegration) {
      availableIntegrations = [];
      selectedIntegrationTypes.forEach(t => {
        availableIntegrations?.push({
          type: t,
          officialWording: t === 'CUSTOM' ? customIntegrationWording : undefined,
          customTeacherContent: t === 'CUSTOM' ? customIntegrationWording : undefined
        });
      });
    }

    const cleanUnit = currentRecord.unit.replace(/ -> /g, ' → ');

    const newPlan = generateStructuredLessonPlan({
      programCode: 'MOVE_UP',
      gradeLevel: 2,
      weekNumber: currentRecord.week,
      lessonPlanLabel: currentRecord.lesson_plan,
      sourcePeriods: currentRecord.source_periods,
      pages: currentRecord.pages,
      unitTitle: cleanUnit,
      lessonTitle: currentRecord.lesson_title,
      durationMinutes: 70, // 2 periods combined (35 mins x 2 = 70 mins)
      phonics: currentRecord.phonics,
      vocabulary: vocabList,
      sentencePatterns: patternList,
      rawVocabulary: currentRecord.vocabulary,
      rawSentencePatterns: currentRecord.sentence_patterns,
      activities: currentRecord.activities,
      learningOutcomes: currentRecord.learning_outcomes,
      teacherInstructions,
      availableIntegrations,
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
      alert('Failed to save MOVE UP plan: ' + error.message);
    } else {
      alert('MOVE UP Lesson plan saved successfully!');
    }
  };

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto mb-4">
          <button
            onClick={() => setGeneratedPlan(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to MOVE UP Selection</span>
          </button>
        </div>
        <LessonPlanEditor plan={generatedPlan} onSave={handleSavePlan} />
      </div>
    );
  }

  return (
    <div className="w-full text-slate-100 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/30 shrink-0">
              <LibraryBig className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold mb-1">
                <span>Verified Supabase Master Database</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wide">MOVE UP 2</h1>
              <p className="text-xs text-blue-300 max-w-md">
                Primary English Curriculum • Grade 2 • 34 Weeks (34 Combined Lesson Plans)
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-xl space-y-6">
          
          {/* Active Grade Display (Move Up 2 only) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Curriculum Option
            </label>
            <div className="flex items-center space-x-3 bg-slate-800/80 border border-blue-500/40 rounded-2xl p-4 text-slate-200">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-white text-sm">MOVE UP 2 (Grade 2)</span>
                <p className="text-xs text-slate-400">Supported grade level with 34 official combined lesson plans.</p>
              </div>
            </div>
          </div>

          {records.length === 0 && !loading ? (
            <EmptyState
              title="CURRICULUM DATA NOT FOUND"
              message="No verified MOVE UP curriculum data found in public.move_up_lesson_master."
              actionText="Create Custom Lesson Plan Instead"
              onAction={() => navigate('/create/custom')}
            />
          ) : (
            <>
              {/* Week Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Select Teaching Week ({records.length} Weeks Available)
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer text-sm"
                >
                  {records.map((r) => (
                    <option key={r.week} value={r.week}>
                      Week {r.week} — {r.lesson_plan}: {r.lesson_title} ({r.unit.replace(/ -> /g, ' → ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Week Record Card */}
              {currentRecord && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-sm text-blue-300">
                        Week {currentRecord.week} — {currentRecord.lesson_plan}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: 70 mins (Periods {currentRecord.source_periods})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Curriculum Unit:</span>
                      <span className="text-white font-medium">{currentRecord.unit.replace(/ -> /g, ' → ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Lesson Title:</span>
                      <span className="text-white font-medium">{currentRecord.lesson_title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Textbook Pages:</span>
                      <span className="text-white font-medium">{currentRecord.pages}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Source Periods:</span>
                      <span className="text-white font-medium">Periods {currentRecord.source_periods} (Combined into 1 Lesson Plan)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Integration Selector (Default OFF - User Opt-in Only) */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Cross-Curricular Integration (Opt-in Only)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableIntegration}
                      onChange={(e) => setEnableIntegration(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {!enableIntegration ? (
                  <p className="text-xs text-slate-500 italic">
                    Integration is OFF by default. No Integration section will be included in the generated lesson plan unless opted-in manually.
                  </p>
                ) : (
                  <div className="pt-2 space-y-3">
                    <p className="text-xs text-slate-300 font-semibold">Select integrations to include:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'NLS', label: 'Digital Competence (NLS)' },
                        { id: 'AI', label: 'AI Education' },
                        { id: 'ETHICS', label: 'Moral Education' },
                        { id: 'ENVIRONMENT', label: 'Environmental Protection' },
                        { id: 'STEM', label: 'STEM Education' },
                        { id: 'CUSTOM', label: 'Custom Integration' }
                      ].map((item) => (
                        <label key={item.id} className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedIntegrationTypes.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIntegrationTypes([...selectedIntegrationTypes, item.id]);
                              } else {
                                setSelectedIntegrationTypes(selectedIntegrationTypes.filter(t => t !== item.id));
                              }
                            }}
                            className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-slate-200">{item.label}</span>
                        </label>
                      ))}
                    </div>

                    {selectedIntegrationTypes.includes('CUSTOM') && (
                      <div className="pt-1">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Integration Wording:</label>
                        <input
                          type="text"
                          value={customIntegrationWording}
                          onChange={(e) => setCustomIntegrationWording(e.target.value)}
                          placeholder="e.g. Encourage pupils to maintain classroom cleanliness during group work"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Instructions */}
              <TeacherInstructions
                value={teacherInstructions}
                onChange={setTeacherInstructions}
              />

              {/* Generate Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!currentRecord}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE MOVE UP LESSON PLAN</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
