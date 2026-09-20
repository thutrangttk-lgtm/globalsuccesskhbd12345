import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Edit, Trash2, FileDown, Search, Filter } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LessonPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { exportToWord } from '../utils/wordExport';
import { SkeletonLoader } from '../components/SkeletonLoader';

export const MyLessonPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    if (!supabase || !isSupabaseConfigured || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching plans:', error);
      setPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !supabase) return;
    if (!confirm('Are you sure you want to delete this lesson plan?')) return;

    const { error } = await supabase.from('lesson_plans').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
      setPlans(plans.filter((p) => p.id !== id));
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      (plan.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.unit_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.lesson_title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram =
      selectedProgramFilter === 'ALL' || plan.teaching_program_code === selectedProgramFilter;

    return matchesSearch && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">MY LESSON PLANS</h1>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Saved Lesson Plans & Word Exports
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md self-start sm:self-auto"
          >
            + Create New Plan
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lesson title, unit, or topic..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 w-full md:w-auto"
            >
              <option value="ALL">All Programs</option>
              <option value="GLOBAL_SUCCESS">Global Success</option>
              <option value="MOVE_UP">MOVE UP</option>
              <option value="ENHANCED">Bài Dạy Tăng Cường</option>
              <option value="CUSTOM">Custom Lesson Plan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader count={4} />
        ) : filteredPlans.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Lesson Plans Saved Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              Select one of the creation modes on your dashboard to build your first CV 2345 compliant lesson plan.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Grade {plan.grade_level} • {plan.teaching_program_code.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {plan.lesson_title || plan.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {plan.unit_title || 'Unit'} • {plan.duration_minutes || 35} mins
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/preview/${plan.id}`, { state: { plan } })}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Preview Lesson Plan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate(`/edit/${plan.id}`, { state: { plan } })}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Lesson Plan"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => exportToWord(plan)}
                      className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                      title="Export to Word (.docx)"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
