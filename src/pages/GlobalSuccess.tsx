import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
import { GradeSelector } from '../components/GradeSelector';
import { UnitSelector } from '../components/UnitSelector';
import type { SelectableUnitOption } from '../components/UnitSelector';
import { LessonSelector } from '../components/LessonSelector';
import type { SelectableLessonOption } from '../components/LessonSelector';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import { EmptyState } from '../components/EmptyState';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CurriculumLessonMaster, LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { generateStructuredLessonPlan } from '../utils/lessonGenerator';
import { findTeacherChannelVideo } from '../utils/videoMatcher';

export const GlobalSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [masterRecords, setMasterRecords] = useState<CurriculumLessonMaster[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectableUnitOption[]>([]);
  const [selectedUnitKey, setSelectedUnitKey] = useState<string | null>(null);

  const [lessonOptions, setLessonOptions] = useState<SelectableLessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const [teacherInstructions, setTeacherInstructions] = useState('');
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [noDataError, setNoDataError] = useState<string | null>(null);

  // 1. Fetch grade data directly from public.curriculum_lesson_master
  useEffect(() => {
    async function fetchCurriculumData() {
      setLoadingUnits(true);
      setSelectedUnitKey(null);
      setSelectedLessonId(null);
      setLessonOptions([]);
      setMasterRecords([]);
      setUnitOptions([]);
      setNoDataError(null);

      if (!supabase || !isSupabaseConfigured) {
        setLoadingUnits(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('curriculum_lesson_master')
          .select('*')
          .eq('grade', selectedGrade)
          .order('sequence_no', { ascending: true });

        if (error) {
          console.error('Error querying curriculum_lesson_master:', error);
          setMasterRecords([]);
          setLoadingUnits(false);
          return;
        }

        const records: CurriculumLessonMaster[] = data || [];
        setMasterRecords(records);

        // Group into Units & Non-Unit sections
        const optionsMap = new Map<string, SelectableUnitOption>();

        records.forEach(r => {
          if (r.item_type === 'UNIT' && r.unit_number !== null) {
            const key = `unit_${r.unit_number}`;
            if (!optionsMap.has(key)) {
              const cleanTitle = (r.unit_title || '').replace(/^(unit\s*\d+[:\s]*)+/i, '').trim();
              optionsMap.set(key, {
                id: key,
                unit_number: r.unit_number,
                title: cleanTitle,
                item_type: 'UNIT',
                displayLabel: `Unit ${r.unit_number}: ${cleanTitle}`
              });
            }
          } else {
            const groupTitle = r.title || r.display_title || r.item_type;
            const key = `section_${r.item_type}_${groupTitle}`;
            if (!optionsMap.has(key)) {
              optionsMap.set(key, {
                id: key,
                unit_number: null,
                title: groupTitle,
                item_type: r.item_type,
                displayLabel: groupTitle
              });
            }
          }
        });

        const options = Array.from(optionsMap.values());
        setUnitOptions(options);

        if (options.length > 0) {
          setSelectedUnitKey(options[0].id);
        }
      } catch (err) {
        console.error('Failed to query curriculum_lesson_master:', err);
      } finally {
        setLoadingUnits(false);
      }
    }

    fetchCurriculumData();
  }, [selectedGrade]);

  // 2. Filter lessons when selectedUnitKey changes
  useEffect(() => {
    if (!selectedUnitKey || masterRecords.length === 0) {
      setLessonOptions([]);
      setSelectedLessonId(null);
      return;
    }

    setLoadingLessons(true);
    setNoDataError(null);

    let matchingRows: CurriculumLessonMaster[] = [];
    const selectedOpt = unitOptions.find(u => u.id === selectedUnitKey);

    if (selectedUnitKey.startsWith('unit_')) {
      const unitNum = parseInt(selectedUnitKey.replace('unit_', ''), 10);
      matchingRows = masterRecords.filter(m => m.item_type === 'UNIT' && m.unit_number === unitNum);
    } else if (selectedOpt) {
      matchingRows = masterRecords.filter(m =>
        m.item_type === selectedOpt.item_type &&
        (m.title === selectedOpt.title || m.display_title === selectedOpt.title)
      );
    } else if (selectedUnitKey.startsWith('section_')) {
      const itemId = selectedUnitKey.replace('section_', '');
      matchingRows = masterRecords.filter(m => m.id === itemId);
    }

    const isTerminalType = selectedOpt && ['TEST', 'TEST_REVISION', 'TEST_SEMESTER'].includes(selectedOpt.item_type || '');

    if (isTerminalType || (matchingRows.length === 1 && matchingRows[0].part === matchingRows[0].title)) {
      setLessonOptions([]);
      if (matchingRows.length > 0) {
        setSelectedLessonId(matchingRows[0].id);
      } else {
        setSelectedLessonId(null);
      }
    } else {
      const lessonOpts: SelectableLessonOption[] = matchingRows.map(m => ({
        id: m.id,
        lesson_number: m.lesson_number,
        part: m.part,
        display_title: m.display_title,
        title: m.title
      }));

      setLessonOptions(lessonOpts);
      if (lessonOpts.length > 0) {
        setSelectedLessonId(lessonOpts[0].id);
      } else {
        setSelectedLessonId(null);
      }
    }
    setLoadingLessons(false);
  }, [selectedUnitKey, masterRecords, unitOptions]);

  // 3. Generate Lesson Plan
  const handleGenerate = async () => {
    setNoDataError(null);

    const selectedRecord = masterRecords.find(m => m.id === selectedLessonId);

    if (!selectedRecord) {
      setNoDataError("Verified curriculum data is not available for this lesson.");
      return;
    }

    // Parse vocabulary & sentence patterns from DB record
    const rawVocab = (selectedRecord.vocabulary || '').trim();
    const rawPatterns = (selectedRecord.sentence_patterns || '').trim();

    const vocabList = rawVocab.length > 0
      ? rawVocab.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
      : ['[DATA MISSING / NEEDS VERIFIED SOURCE]'];

    const patternList = rawPatterns.length > 0
      ? rawPatterns.split(/[|;\n]/).map(s => s.trim()).filter(Boolean)
      : ['[DATA MISSING / NEEDS VERIFIED SOURCE]'];

    // Exact Integration details
    const nameExact = selectedRecord.integration_name_exact;
    const codeExact = selectedRecord.integration_code_exact;
    const detailExact = selectedRecord.integration_detail_exact;

    // Unit Title formatting rule (UNIT {unit_number}: {unit_title})
    let formattedUnitTitle = '';
    if (selectedRecord.item_type === 'UNIT' && selectedRecord.unit_number !== null) {
      const cleanTitle = (selectedRecord.unit_title || '').replace(/^(unit\s*\d+[:\s]*)+/i, '').trim();
      formattedUnitTitle = `UNIT ${selectedRecord.unit_number}: ${cleanTitle.toUpperCase()}`;
    } else {
      formattedUnitTitle = (selectedRecord.title || selectedRecord.display_title || 'CURRICULUM ITEM').toUpperCase();
    }

    // Lesson Title formatting rule
    let formattedLessonTitle = '';
    if (selectedRecord.lesson_number !== null && selectedRecord.lesson_number !== undefined) {
      formattedLessonTitle = `LESSON ${selectedRecord.lesson_number}`;
    } else if (selectedRecord.part) {
      formattedLessonTitle = selectedRecord.part.toUpperCase();
    } else {
      formattedLessonTitle = (selectedRecord.title || selectedRecord.display_title || 'LESSON 1').toUpperCase();
    }

    const allowExternal = profile?.allow_external_youtube ?? (localStorage.getItem('allow_external_youtube') === 'true');
    const youtubeUrl = profile?.youtube_channel_url || localStorage.getItem('teacher_youtube_url') || '';
    const matchedVideo = await findTeacherChannelVideo({
      teacherId: user?.id,
      youtubeChannelUrl: youtubeUrl,
      allowExternalYoutube: allowExternal,
      gradeLevel: selectedGrade,
      unitNumber: selectedRecord.unit_number || undefined,
      unitTitle: selectedRecord.unit_title || undefined,
      topic: selectedRecord.khdh_topic || undefined,
      lessonTitle: formattedLessonTitle,
      vocabulary: vocabList.filter(v => !v.includes('[DATA MISSING'))
    });

    const newPlan = generateStructuredLessonPlan({
      programCode: 'GLOBAL_SUCCESS',
      gradeLevel: selectedGrade,
      unitNumber: selectedRecord.unit_number || undefined,
      unitTitle: formattedUnitTitle,
      lessonNumber: selectedRecord.lesson_number || undefined,
      lessonTitle: formattedLessonTitle,
      itemType: selectedRecord.item_type,
      displayTitle: selectedRecord.display_title || selectedRecord.title || undefined,
      phonics: selectedRecord.phonics,
      vocabulary: vocabList,
      sentencePatterns: patternList,
      integration_name_exact: nameExact,
      integration_code_exact: codeExact,
      integration_detail_exact: detailExact,
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
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
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
              <span>Verified Supabase Master Database</span>
            </div>
            <h1 className="text-2xl font-black text-[#0f766e] tracking-wide">GLOBAL SUCCESS</h1>
            <p className="text-xs text-slate-600 max-w-md">
              Official Primary English series by Vietnam Education Publishing House (Grades 1–5).
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

          {unitOptions.length === 0 && !loadingUnits ? (
            <EmptyState
              title="CURRICULUM DATA HAS NOT BEEN IMPORTED YET."
              message={`No verified Global Success curriculum data found for Grade ${selectedGrade} in public.curriculum_lesson_master.`}
              actionText="Create Custom Lesson Plan Instead"
              onAction={() => navigate('/create/custom')}
            />
          ) : (
            <>
              <UnitSelector
                units={unitOptions}
                selectedUnitId={selectedUnitKey}
                onSelectUnit={setSelectedUnitKey}
                loading={loadingUnits}
              />

              {selectedUnitKey && lessonOptions.length > 0 && (
                <LessonSelector
                  lessons={lessonOptions}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={setSelectedLessonId}
                  loading={loadingLessons}
                />
              )}

              {noDataError && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{noDataError}</span>
                </div>
              )}

              <TeacherInstructions
                value={teacherInstructions}
                onChange={setTeacherInstructions}
              />

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2 cursor-pointer"
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

