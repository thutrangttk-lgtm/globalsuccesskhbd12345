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

export const GlobalSuccess: React.FC = () => {
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
          .eq('code', 'GLOBAL_SUCCESS')
          .single();

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

  const handleGenerate = () => {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    const selectedLesson = lessons.find(l => l.id === selectedLessonId);

    const unitTitle = selectedUnit ? `Unit ${selectedUnit.unit_number}: ${selectedUnit.title}` : `Unit Title Grade ${selectedGrade}`;
    const lessonTitle = selectedLesson ? `Lesson ${selectedLesson.lesson_number} - ${selectedLesson.title}` : 'Lesson 1';

    const newPlan: LessonPlan = {
      teacher_id: user?.id,
      teaching_program_code: 'GLOBAL_SUCCESS',
      grade_level: selectedGrade,
      unit_id: selectedUnitId || undefined,
      lesson_id: selectedLessonId || undefined,
      title: `Lesson Plan Grade ${selectedGrade} - Global Success`,
      unit_title: unitTitle,
      lesson_title: lessonTitle,
      duration_minutes: selectedLesson?.duration_minutes || 35,
      publisher: 'VIETNAM EDUCATION PUBLISHING HOUSE',
      vocabulary: ['hello', 'hi', 'goodbye', 'friend'],
      sentence_patterns: ['How are you? - I am fine, thank you.', 'What is your name? - My name is...'],
      skills: ['Listening', 'Speaking', 'Reading', 'Writing'],
      competences_qualities_text: "Thereby contributing to the development of pupils' general competences and qualities (autonomy, communication, cooperation).",
      integrations: [
        {
          id: 'int_1',
          type: 'NLS',
          code: 'NLS_1.1.2',
          wording: 'Pupils select digital learning activities under teacher guidance.'
        }
      ],
      teaching_aids: [
        'Global Success textbook Grade ' + selectedGrade,
        "Teacher's Book",
        'Audio tracks & flashcards',
        'Interactive whiteboard / Projector'
      ],
      procedures: [
        {
          id: 'p1',
          stageName: 'Warm-up (5 mins)',
          teacherActivities: [
            'Teacher greets pupils and plays the warm-up song.',
            'Teacher asks pupils simple questions to review previous vocabulary.'
          ],
          pupilActivities: [
            'Pupils greet the teacher and sing along.',
            'Pupils answer teacher questions in chorus.'
          ],
          expectedOutcome: 'Pupils feel motivated and review previous words.',
          evidence: 'Pupils sing along enthusiastically and answer questions accurately.',
          postLessonAdjustments: '' // BLANK
        },
        {
          id: 'p2',
          stageName: 'Presentation (10 mins)',
          teacherActivities: [
            'Teacher presents new vocabulary using flashcards and audio.',
            'Teacher introduces target sentence pattern on the board.'
          ],
          pupilActivities: [
            'Pupils look, listen, and repeat new vocabulary.',
            'Pupils observe the sentence pattern and repeat.'
          ],
          expectedOutcome: 'Pupils pronounce target words correctly and understand sentence pattern.',
          evidence: 'Pupils pronounce words correctly and repeat sentences with accurate intonation.',
          integrationCode: 'NLS_1.1.2',
          integrationLabel: 'NLS',
          postLessonAdjustments: '' // BLANK
        },
        {
          id: 'p3',
          stageName: 'Practice (12 mins)',
          teacherActivities: [
            'Teacher organizes pair work for pupils to practise sentence pattern.',
            'Teacher monitors pairs and provides support when necessary.'
          ],
          pupilActivities: [
            'Pupils practise asking and answering in pairs.',
            'Pupils switch roles with partners.'
          ],
          expectedOutcome: 'Pupils use target sentence patterns in pair communication.',
          evidence: 'Pupils ask and answer accurately with their partners.',
          postLessonAdjustments: '' // BLANK
        },
        {
          id: 'p4',
          stageName: 'Production & Consolidation (8 mins)',
          teacherActivities: [
            'Teacher invites pair presentations in front of class.',
            'Teacher summarizes key words and gives feedback.'
          ],
          pupilActivities: [
            'Pupils present pair work in front of class.',
            'Pupils listen to feedback and repeat key points.'
          ],
          expectedOutcome: 'Pupils communicate confidently using target language.',
          evidence: 'Pupils present dialogue clearly before the class.',
          postLessonAdjustments: '' // BLANK
        }
      ],
      post_reflection: 'The lesson was delivered successfully according to Global Success curriculum objectives. Pupils were active and engaged.'
    };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">GLOBAL SUCCESS</h1>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
              Official Textbook Series • Grades 1–5
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
    </div>
  );
};
