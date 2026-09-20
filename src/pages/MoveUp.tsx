import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LibraryBig, Sparkles, ArrowLeft } from 'lucide-react';
import { GradeSelector } from '../components/GradeSelector';
import { UnitSelector } from '../components/UnitSelector';
import { LessonSelector } from '../components/LessonSelector';
import { TeacherInstructions } from '../components/TeacherInstructions';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import { EmptyState } from '../components/EmptyState';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CurriculumUnit, Lesson, LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';

export const MoveUp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          .eq('code', 'MOVE_UP')
          .single();

        if (programData) {
          const { data } = await supabase
            .from('curriculum_units')
            .select('*')
            .eq('teaching_program_id', programData.id)
            .eq('grade_level', selectedGrade)
            .order('unit_number', { ascending: true });

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
        const { data } = await supabase
          .from('lessons')
          .select('*')
          .eq('unit_id', selectedUnitId)
          .order('lesson_number', { ascending: true });

        setLessons(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLessons(false);
      }
    }

    fetchLessons();
  }, [selectedUnitId]);

  const handleGenerate = () => {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    const selectedLesson = lessons.find(l => l.id === selectedLessonId);

    const unitTitle = selectedUnit ? `MOVE UP Unit ${selectedUnit.unit_number}: ${selectedUnit.title}` : `MOVE UP Unit Grade ${selectedGrade}`;
    const lessonTitle = selectedLesson ? `Lesson ${selectedLesson.lesson_number} - ${selectedLesson.title}` : 'Lesson 1';

    const newPlan: LessonPlan = {
      teacher_id: user?.id,
      teaching_program_code: 'MOVE_UP',
      grade_level: selectedGrade,
      unit_id: selectedUnitId || undefined,
      lesson_id: selectedLessonId || undefined,
      title: `Lesson Plan Grade ${selectedGrade} - MOVE UP`,
      unit_title: unitTitle,
      lesson_title: lessonTitle,
      duration_minutes: selectedLesson?.duration_minutes || 35,
      vocabulary: ['jump', 'run', 'swim', 'fly'],
      sentence_patterns: ['I can jump.', 'Can you swim? - Yes, I can.'],
      skills: ['Listening', 'Speaking', 'Reading'],
      competences_qualities_text: "Thereby contributing to the development of pupils' general competences and qualities (autonomy, communication, cooperation).",
      integrations: [],
      teaching_aids: [
        'MOVE UP textbook Level ' + selectedGrade,
        'Audio tracks & action cards',
        'Interactive projector'
      ],
      procedures: [
        {
          id: 'p1',
          stageName: 'Warm-up (5 mins)',
          teacherActivities: [
            'Teacher leads TPR action song (Jump, Run, Freeze).',
            'Teacher asks pupils to demonstrate actions.'
          ],
          pupilActivities: [
            'Pupils perform actions and sing along.',
            'Pupils demonstrate actions when called.'
          ],
          expectedOutcome: 'Pupils participate in physical actions and warm up.',
          evidence: 'Pupils perform actions accurately following teacher commands.',
          postLessonAdjustments: ''
        },
        {
          id: 'p2',
          stageName: 'Presentation (10 mins)',
          teacherActivities: [
            'Teacher presents action verbs with flashcards.',
            'Teacher introduces sentence pattern: I can [verb].'
          ],
          pupilActivities: [
            'Pupils look, listen, and repeat action verbs.',
            'Pupils say sentences: I can jump / I can run.'
          ],
          expectedOutcome: 'Pupils pronounce action verbs and state abilities.',
          evidence: 'Pupils form correct sentences describing abilities.',
          postLessonAdjustments: ''
        },
        {
          id: 'p3',
          stageName: 'Practice (12 mins)',
          teacherActivities: [
            'Teacher organizes group action guessing game.',
            'Teacher monitors and encourages speaking.'
          ],
          pupilActivities: [
            'Pupils work in groups of 4 to mime and guess actions.',
            'Pupils ask: Can you swim? and answer.'
          ],
          expectedOutcome: 'Pupils use question and answer structures fluently.',
          evidence: 'Pupils ask and answer questions accurately during the game.',
          postLessonAdjustments: ''
        },
        {
          id: 'p4',
          stageName: 'Wrap-up (8 mins)',
          teacherActivities: [
            'Teacher summarizes lesson and reviews action words.',
            'Teacher assigns simple oral review.'
          ],
          pupilActivities: [
            'Pupils repeat key vocabulary.',
            'Pupils complete wrap-up action check.'
          ],
          expectedOutcome: 'Pupils consolidate target action vocabulary.',
          evidence: 'Pupils recite action verbs confidently.',
          postLessonAdjustments: ''
        }
      ],
      post_reflection: 'The MOVE UP lesson was conducted successfully with high pupil participation in TPR activities.'
    };

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
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
            <LibraryBig className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">MOVE UP</h1>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Enhanced English Curriculum • Grades 1–5
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <GradeSelector selectedGrade={selectedGrade} onSelectGrade={setSelectedGrade} />

          {units.length === 0 && !loadingUnits ? (
            <EmptyState
              title="CURRICULUM DATA HAS NOT BEEN IMPORTED YET."
              message={`No verified MOVE UP curriculum data found for Grade ${selectedGrade} in Supabase.`}
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
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
