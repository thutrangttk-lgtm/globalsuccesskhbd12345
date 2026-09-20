import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LessonPlanPreview } from '../components/LessonPlanPreview';
import type { LessonPlan } from '../types';
import { supabase } from '../lib/supabase';

export const LessonPlanPreviewPage: React.FC = () => {
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

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading preview...</div>;
  }

  if (!plan) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Lesson plan not found.</div>;
  }

  return (
    <LessonPlanPreview
      plan={plan}
      onBack={() => navigate(-1)}
    />
  );
};
