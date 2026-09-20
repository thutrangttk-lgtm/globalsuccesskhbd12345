import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LessonPlanEditor } from '../components/LessonPlanEditor';
import type { LessonPlan } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export const LessonPlanEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<LessonPlan | null>(location.state?.plan || null);
  const [loading, setLoading] = useState(!location.state?.plan);

  useEffect(() => {
    if (!plan && id && supabase) {
      supabase
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (data) setPlan(data as LessonPlan);
          if (error) console.error(error);
          setLoading(false);
        });
    }
  }, [id, plan]);

  const handleSave = async (updatedPlan: LessonPlan) => {
    if (!supabase || !id) return;
    const { error } = await supabase
      .from('lesson_plans')
      .update(updatedPlan)
      .eq('id', id);

    if (error) {
      alert('Failed to update: ' + error.message);
    } else {
      alert('Updated lesson plan successfully!');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading lesson plan...</div>;
  }

  if (!plan) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Lesson plan not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-4">
        <button
          onClick={() => navigate('/my-plans')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Plans</span>
        </button>
      </div>

      <LessonPlanEditor
        plan={plan}
        onSave={handleSave}
        onPreview={() => navigate(`/preview/${id}`, { state: { plan } })}
      />
    </div>
  );
};
