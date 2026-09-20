import React, { useState } from 'react';
import type { LessonPlan, IntegrationItem } from '../types';
import { ProceduresTable } from './ProceduresTable';
import { exportToWord } from '../utils/wordExport';
import { Save, Eye, FileDown, Printer, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface LessonPlanEditorProps {
  plan: LessonPlan;
  onSave?: (updatedPlan: LessonPlan) => Promise<void>;
  onPreview?: () => void;
}

export const LessonPlanEditor: React.FC<LessonPlanEditorProps> = ({
  plan: initialPlan,
  onSave,
  onPreview
}) => {
  const [plan, setPlan] = useState<LessonPlan>(initialPlan);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFieldChange = (field: keyof LessonPlan, value: any) => {
    setPlan({ ...plan, [field]: value });
  };

  const handleArrayTextChange = (field: 'vocabulary' | 'sentence_patterns' | 'skills' | 'teaching_aids', rawText: string) => {
    const list = rawText.split('\n').map((item) => item.trim()).filter(Boolean);
    setPlan({ ...plan, [field]: list });
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(plan);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportWord = async () => {
    setExporting(true);
    try {
      await exportToWord(plan);
    } catch (err) {
      console.error('Word export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddIntegration = () => {
    const newInt: IntegrationItem = {
      id: `int_${Date.now()}`,
      type: 'NLS',
      code: 'NLS_1.1.2',
      wording: 'Pupils select digital learning activities under guidance.'
    };
    setPlan({ ...plan, integrations: [...(plan.integrations || []), newInt] });
  };

  const handleDeleteIntegration = (idx: number) => {
    const updated = (plan.integrations || []).filter((_, i) => i !== idx);
    setPlan({ ...plan, integrations: updated });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl space-y-8">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 no-print">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-bold text-white uppercase tracking-wider">Lesson Plan Editor</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'SAVE'}</span>
            </button>
          )}

          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>PREVIEW</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportWord}
            disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
          >
            <FileDown className="w-4 h-4" />
            <span>{exporting ? 'Generating Word...' : 'XUẤT WORD'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span>Lesson plan saved successfully!</span>
        </div>
      )}

      {/* FIXED INSTITUTIONAL HEADER (ENGLISH) */}
      <div className="bg-white text-black p-8 rounded-xl font-serif text-sm shadow-inner space-y-6">
        
        {/* Header Lines */}
        <div className="text-left font-bold text-slate-900 leading-tight">
          <p>HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE</p>
          <p>TRANG TAN KHUONG PRIMARY SCHOOL</p>
          <p>TEACHER: TRAN THI THU TRANG</p>
        </div>

        {/* Main Title */}
        <div className="text-center pt-2 pb-1">
          <h1 className="text-xl font-bold tracking-wide text-[#1F4E78] uppercase">
            LESSON PLAN GRADE {plan.grade_level} - {plan.teaching_program_code.replace('_', ' ')}
          </h1>
          {(plan.teaching_program_code === 'GLOBAL_SUCCESS' || plan.publisher) && (
            <p className="text-sm font-bold text-black uppercase mt-1">
              {plan.publisher || 'VIETNAM EDUCATION PUBLISHING HOUSE'}
            </p>
          )}
        </div>

        {/* Lesson Identification */}
        <div className="space-y-1 font-bold text-slate-900 border-b border-slate-200 pb-4">
          <p>{plan.unit_title || `UNIT ${plan.unit_id || ''}`}</p>
          <p>LESSON: {plan.lesson_title || plan.title}</p>
          <p className="font-normal italic text-slate-700 text-xs">Duration: {plan.duration_minutes || 35} minutes</p>
        </div>

        {/* SECTION I. OBJECTIVES */}
        <div>
          <h2 className="text-base font-bold text-[#1F4E78] uppercase mb-2">I. OBJECTIVES</h2>
          <p className="italic text-slate-700 mb-3">By the end of the lesson, pupils will be able to:</p>

          {/* 1. Language Knowledge & Skills */}
          <div className="ml-4 space-y-3 mb-4">
            <h3 className="font-bold text-[#548235]">1. Language Knowledge & Skills</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vocabulary:</label>
              <textarea
                rows={2}
                value={(plan.vocabulary || []).join('\n')}
                onChange={(e) => handleArrayTextChange('vocabulary', e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sentence Patterns:</label>
              <textarea
                rows={2}
                value={(plan.sentence_patterns || []).join('\n')}
                onChange={(e) => handleArrayTextChange('sentence_patterns', e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Skills:</label>
              <input
                type="text"
                value={(plan.skills || []).join(', ')}
                onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()))}
                className="w-full border border-slate-300 rounded p-2 text-xs font-sans"
              />
            </div>
          </div>

          {/* 2. Core / General Competences and Qualities */}
          <div className="ml-4 space-y-2 mb-4">
            <h3 className="font-bold text-[#548235]">2. Core / General Competences and Qualities</h3>
            <textarea
              rows={2}
              value={plan.competences_qualities_text}
              onChange={(e) => handleFieldChange('competences_qualities_text', e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs font-sans text-slate-800"
            />
          </div>

          {/* 3. Integration */}
          <div className="ml-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#548235]">3. Integration</h3>
              <button
                type="button"
                onClick={handleAddIntegration}
                className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-2.5 py-1 rounded font-sans font-semibold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Integration</span>
              </button>
            </div>

            {(plan.integrations || []).map((item, idx) => (
              <div key={item.id || idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-200">
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => {
                    const next = [...plan.integrations];
                    next[idx].type = e.target.value as any;
                    handleFieldChange('integrations', next);
                  }}
                  className="w-24 border rounded p-1 text-xs font-sans font-bold text-emerald-800"
                />
                <input
                  type="text"
                  value={item.code || ''}
                  onChange={(e) => {
                    const next = [...plan.integrations];
                    next[idx].code = e.target.value;
                    handleFieldChange('integrations', next);
                  }}
                  placeholder="Code (e.g. NLS_1.1.2)"
                  className="w-32 border rounded p-1 text-xs font-mono"
                />
                <input
                  type="text"
                  value={item.wording}
                  onChange={(e) => {
                    const next = [...plan.integrations];
                    next[idx].wording = e.target.value;
                    handleFieldChange('integrations', next);
                  }}
                  placeholder="Description"
                  className="flex-1 border rounded p-1 text-xs font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteIntegration(idx)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION II. TEACHING AIDS AND LEARNING MATERIALS */}
        <div>
          <h2 className="text-base font-bold text-[#1F4E78] uppercase mb-2">II. TEACHING AIDS AND LEARNING MATERIALS</h2>
          <textarea
            rows={2}
            value={(plan.teaching_aids || []).join('\n')}
            onChange={(e) => handleArrayTextChange('teaching_aids', e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-xs font-sans"
          />
        </div>

        {/* SECTION III. TEACHING PROCEDURES */}
        <div>
          <h2 className="text-base font-bold text-[#1F4E78] uppercase mb-2">III. TEACHING PROCEDURES</h2>
          <ProceduresTable
            procedures={plan.procedures || []}
            onChange={(updated) => handleFieldChange('procedures', updated)}
            editable={true}
          />
        </div>

        {/* SECTION POST-REFLECTION */}
        <div>
          <h2 className="text-base font-bold text-[#1F4E78] uppercase mb-2">POST-REFLECTION</h2>
          <textarea
            rows={2}
            value={plan.post_reflection || ''}
            onChange={(e) => handleFieldChange('post_reflection', e.target.value)}
            placeholder="Write 2-3 short sentences about lesson outcome..."
            className="w-full border border-slate-300 rounded p-2 text-xs font-sans"
          />
        </div>

        {/* FINAL SIGNATURE SECTION (Side by Side) */}
        <div className="pt-6 grid grid-cols-2 text-center font-bold">
          <div>
            <p>BAN GIÁM HIỆU</p>
            <div className="h-20"></div>
            <p>Trương Thị Lệ Hằng</p>
          </div>
          <div>
            <p>TỔ TRƯỜNG</p>
            <div className="h-20"></div>
            <p>Nguyễn Thị Ngà</p>
          </div>
        </div>

      </div>
    </div>
  );
};
