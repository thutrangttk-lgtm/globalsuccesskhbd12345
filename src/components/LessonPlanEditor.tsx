import React, { useState } from 'react';
import type { LessonPlan, IntegrationItem, ProcedureRow } from '../types';
import { ProceduresTable } from './ProceduresTable';
import { exportToWord, getExportFileName } from '../utils/wordExport';
import { Save, Eye, FileDown, Printer, CheckCircle, Plus, Trash2, Video, Lock, RotateCcw } from 'lucide-react';
import { INTEGRATION_LABEL_NAMES, getDefaultIntegrationSuggestion } from '../utils/lessonGenerator';

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
    const origTitle = document.title;
    const baseName = getExportFileName(plan, 'pdf').replace(/\.pdf$/, '');
    document.title = baseName;
    window.print();
    setTimeout(() => {
      document.title = origTitle;
    }, 1000);
  };

  const handleAddPresetIntegration = (typeKey: string) => {
    if (!typeKey) return;
    const vocabText = (plan.vocabulary || []).join(', ') || 'target words';
    const mainPattern = (plan.sentence_patterns || [])[0] || 'target sentence pattern';
    const defaultSuggestion = getDefaultIntegrationSuggestion(typeKey, vocabText, mainPattern);

    const newInt: IntegrationItem = {
      id: `int_${Date.now()}`,
      type: typeKey as any,
      code: typeKey === 'NLS' ? (plan.grade_level ? `NLS_${plan.grade_level}.1.2` : 'NLS_3.1.2') : (typeKey === 'AI' ? 'AI_2422' : undefined),
      wording: typeKey === 'NLS' ? 'Pupils select teacher-approved digital resources during lesson practice.' : (typeKey === 'AI' ? 'Pupils use AI speech feedback application for pronunciation accuracy.' : INTEGRATION_LABEL_NAMES[typeKey] || typeKey),
      official_code: typeKey === 'NLS' ? (plan.grade_level ? `NLS_${plan.grade_level}.1.2` : 'NLS_3.1.2') : (typeKey === 'AI' ? 'AI_2422' : undefined),
      official_wording: typeKey === 'NLS' ? 'Pupils select teacher-approved digital resources during lesson practice.' : (typeKey === 'AI' ? 'Pupils use AI speech feedback application for pronunciation accuracy.' : undefined),
      custom_teacher_content: defaultSuggestion,
      isCustomLabel: false
    };

    const updatedIntegrations = [...(plan.integrations || []), newInt];
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const handleAddCustomIntegration = () => {
    const mainPattern = (plan.sentence_patterns || [])[0] || 'target sentence pattern';

    const newInt: IntegrationItem = {
      id: `int_custom_${Date.now()}`,
      type: 'CUSTOM',
      wording: 'Custom Integration',
      custom_teacher_content: `Pupils apply custom integration content in target speaking practice (${mainPattern}).`,
      isCustomLabel: true,
      customLabelText: 'Custom Educational Integration'
    };

    const updatedIntegrations = [...(plan.integrations || []), newInt];
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const handleUpdateIntegrationContent = (idx: number, newContent: string) => {
    const updatedIntegrations = [...(plan.integrations || [])];
    updatedIntegrations[idx] = {
      ...updatedIntegrations[idx],
      custom_teacher_content: newContent
    };
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const handleUpdateCustomLabelText = (idx: number, newLabel: string) => {
    const updatedIntegrations = [...(plan.integrations || [])];
    updatedIntegrations[idx] = {
      ...updatedIntegrations[idx],
      customLabelText: newLabel
    };
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const handleDeleteIntegration = (idx: number) => {
    const updatedIntegrations = (plan.integrations || []).filter((_, i) => i !== idx);
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const handleClearIntegrationContent = (idx: number) => {
    const updatedIntegrations = [...(plan.integrations || [])];
    updatedIntegrations[idx] = {
      ...updatedIntegrations[idx],
      custom_teacher_content: ''
    };
    updateIntegrationsAndProcedures(updatedIntegrations);
  };

  const updateIntegrationsAndProcedures = (updatedIntegrations: IntegrationItem[]) => {
    const vocabText = (plan.vocabulary || []).join(', ') || 'target vocabulary';
    const mainPattern = (plan.sentence_patterns || [])[0] || 'target sentence pattern';

    const coreProcedures = (plan.procedures || []).filter(p => !p.integrationCode && !p.integrationLabel && !p.stageName.includes('Production & Integration'));

    const integrationProcedures: ProcedureRow[] = updatedIntegrations.map((item, idx) => {
      const labelName = item.isCustomLabel ? (item.customLabelText || 'Custom Integration') : (INTEGRATION_LABEL_NAMES[item.type] || item.type);
      const customContent = item.custom_teacher_content || getDefaultIntegrationSuggestion(item.type, vocabText, mainPattern);
      const codeStr = item.official_code || item.code || '';

      return {
        id: `proc_int_${idx}`,
        stageName: `Production & Integration (${labelName}${codeStr ? ` - ${codeStr}` : ''}) (5 mins)`,
        teacherActivities: [
          `Teacher introduces ${labelName} integration task: ${customContent}`,
          `Teacher guides pupils to apply target language (${vocabText} / ${mainPattern}) in the integration task.`,
          'Teacher monitors and provides constructive feedback.'
        ],
        pupilActivities: [
          `Pupils engage in ${labelName} integration activity.`,
          `Pupils perform task: ${customContent}`,
          'Pupils present their findings to the class.'
        ],
        expectedOutcome: `Pupils demonstrate ${labelName} integration competencies and apply target language appropriately.`,
        evidence: `Pupils successfully complete integration activity: ${customContent}`,
        integrationCode: codeStr,
        integrationLabel: labelName,
        postLessonAdjustments: ''
      };
    });

    const consolidationIdx = coreProcedures.findIndex(p => p.stageName.toLowerCase().includes('consolidation'));
    let finalProcedures: ProcedureRow[];
    if (consolidationIdx !== -1) {
      finalProcedures = [
        ...coreProcedures.slice(0, consolidationIdx),
        ...integrationProcedures,
        ...coreProcedures.slice(consolidationIdx)
      ];
    } else {
      finalProcedures = [...coreProcedures, ...integrationProcedures];
    }

    setPlan({
      ...plan,
      integrations: updatedIntegrations,
      procedures: finalProcedures
    });
  };

  const activeVideo = plan.videoMetadata || plan.procedures?.[0]?.videoMetadata;

  const handleChangeWarmup = () => {
    const vocabText = (plan.vocabulary || []).join(', ') || 'target words';
    const updatedProcedures = [...(plan.procedures || [])];
    if (updatedProcedures.length > 0) {
      updatedProcedures[0] = {
        ...updatedProcedures[0],
        stageName: 'Warm-up & Lead-in (5 mins)',
        teacherActivities: [
          `Teacher leads the warm-up game "Slap the Board" using target vocabulary (${vocabText}).`,
          'Teacher writes word cards on the board, explains rules, and models two practice rounds.',
          'Teacher calls out target words and encourages active team participation.'
        ],
        pupilActivities: [
          `Pupils play "Slap the Board" in two teams (whole class & group work).`,
          'Pupils listen to teacher cues and slap the correct target word card on the board.',
          'Pupils pronounce the slapped target word in chorus.'
        ],
        expectedOutcome: `Pupils recall and pronounce target vocabulary (${vocabText}) with high motivation.`,
        evidence: `Pupils correctly identify, slap, and pronounce target word cards on the board.`,
        videoMetadata: undefined
      };
    }
    setPlan({ ...plan, videoMetadata: undefined, procedures: updatedProcedures });
  };

  const handleRemoveVideo = () => {
    const updatedProcedures = [...(plan.procedures || [])];
    if (updatedProcedures.length > 0) {
      updatedProcedures[0] = {
        ...updatedProcedures[0],
        videoMetadata: undefined
      };
    }
    setPlan({ ...plan, videoMetadata: undefined, procedures: updatedProcedures });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto shadow-2xl space-y-6 sm:space-y-8 w-full">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3.5 sm:p-4 rounded-xl border border-slate-700/80 no-print">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Lesson Plan Editor</span>
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
      <div className="bg-white text-black p-4 sm:p-8 rounded-xl font-serif text-xs sm:text-sm shadow-inner space-y-6">
        
        {/* Header Lines */}
        <div className="text-left font-bold text-slate-900 leading-tight">
          <p>HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE</p>
          <p>TRANG TAN KHUONG PRIMARY SCHOOL</p>
          <p>TEACHER: TRAN THI THU TRANG</p>
        </div>

        {/* Top 4 Lines Header: Center Aligned */}
        <div className="text-center pt-2 pb-4 space-y-1 border-b border-slate-200">
          <h1 className="text-lg sm:text-xl font-bold tracking-wide text-[#1F4E78] uppercase">
            LESSON PLAN GRADE {plan.grade_level} - {plan.teaching_program_code === 'GLOBAL_SUCCESS' ? 'GLOBAL SUCCESS' : plan.teaching_program_code.replace('_', ' ')}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black uppercase">
            {plan.publisher || 'VIETNAM EDUCATION PUBLISHING HOUSE'}
          </p>
          <p className="text-sm sm:text-base font-bold text-[#1F4E78] uppercase">
            {plan.unit_title ? (plan.unit_title.toUpperCase().startsWith('UNIT') ? plan.unit_title.toUpperCase() : `UNIT: ${plan.unit_title.toUpperCase()}`) : 'UNIT 1'}
          </p>
          <p className="text-sm sm:text-base text-[#1F4E78]">
            <span className="font-bold uppercase">
              {plan.lesson_title ? (
                plan.lesson_title.toUpperCase().startsWith('LESSON') 
                  ? (plan.lesson_title.match(/LESSON\s*\d+/i)?.[0].toUpperCase() || plan.lesson_title.toUpperCase())
                  : `LESSON ${plan.lesson_title.match(/\d+/)?.[0] || '1'}`
              ) : 'LESSON 1'}
            </span>
            <span className="font-normal text-black capitalize ml-1.5">(Duration: {plan.duration_minutes || 35} minutes)</span>
          </p>
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
          <div className="ml-4 space-y-4 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="font-bold text-[#548235] text-sm">3. Integration</h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPresetIntegration(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs bg-slate-100 text-slate-800 border border-slate-300 rounded px-2.5 py-1.5 font-sans font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">+ Add Preset Integration Label...</option>
                  {Object.entries(INTEGRATION_LABEL_NAMES).filter(([k]) => k !== 'CUSTOM').map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomIntegration}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-sans font-bold shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD CUSTOM INTEGRATION</span>
                </button>
              </div>
            </div>

            {(plan.integrations || []).length === 0 ? (
              <p className="text-xs italic text-slate-500">No integration items added. Use the controls above to select or add custom integration.</p>
            ) : (
              <div className="space-y-3">
                {(plan.integrations || []).map((item, idx) => {
                  const isNLS = item.type === 'NLS';
                  const isAI = item.type === 'AI';
                  const labelTitle = item.isCustomLabel 
                    ? (item.customLabelText || 'Custom Integration') 
                    : (INTEGRATION_LABEL_NAMES[item.type] || item.type);

                  return (
                    <div key={item.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-xs font-sans">
                      
                      {/* Label Bar & Type Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {item.isCustomLabel ? (
                            <input
                              type="text"
                              value={item.customLabelText || ''}
                              onChange={(e) => handleUpdateCustomLabelText(idx, e.target.value)}
                              placeholder="Type Custom Integration Label Name..."
                              className="font-bold text-xs bg-white border border-teal-300 text-teal-900 rounded px-2 py-1 focus:outline-none focus:border-teal-600 w-64"
                            />
                          ) : (
                            <span className="font-bold text-xs bg-teal-100 text-teal-800 border border-teal-300 px-2.5 py-0.5 rounded-full">
                              {labelTitle}
                            </span>
                          )}

                          {/* NLS and AI Read-only Code Protection Badge */}
                          {(isNLS || isAI) && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>{isNLS ? 'Official Code:' : 'YCCD AI Code:'} {item.official_code || item.code}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleClearIntegrationContent(idx)}
                            className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Clear Integration Content"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteIntegration(idx)}
                            className="text-[11px] text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Remove Integration Label"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Official Wording for NLS & AI (Read-Only) */}
                      {(isNLS || isAI) && item.official_wording && (
                        <div className="bg-amber-50/60 border border-amber-200 rounded p-2 text-xs text-amber-950 font-serif">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">Official Source Wording:</span>
                          <p>{item.official_wording}</p>
                        </div>
                      )}

                      {/* Editable Practical Integration Content Textarea */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          {isNLS || isAI ? 'Teacher Integration Content (Editable Practical Activity):' : 'Editable Integration Content Field:'}
                        </label>
                        <textarea
                          rows={2}
                          value={item.custom_teacher_content || item.wording || ''}
                          onChange={(e) => handleUpdateIntegrationContent(idx, e.target.value)}
                          placeholder="Type specific classroom activity statement for this integration..."
                          className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-2.5 text-xs font-sans focus:outline-none focus:border-teal-500 shadow-xs"
                        />
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
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

        {/* YOUTUBE RESOURCE CONTROL CARD FOR TEACHER */}
        {activeVideo && (
          <div className="no-print bg-slate-50 border border-teal-200 rounded-xl p-4 font-sans space-y-3">
            <div className="flex items-center justify-between border-b border-teal-100 pb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                  <Video className="w-4 h-4" />
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  RECOMMENDED YOUTUBE RESOURCE CONTROL
                </span>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeVideo.source === 'teacher' ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                {activeVideo.source === 'teacher' ? "Teacher's YouTube Channel" : 'External YouTube Resource'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-600">Video title:</span>
                <p className="font-bold text-slate-900 mt-0.5">{activeVideo.title}</p>
              </div>
              <div>
                <span className="font-bold text-slate-600">Source URL:</span>
                <p className="font-mono text-teal-700 truncate mt-0.5">{activeVideo.url}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-teal-100">
              <button
                type="button"
                onClick={() => alert('Confirmed: Using this YouTube video resource for Warm-up!')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>USE THIS VIDEO</span>
              </button>

              <button
                type="button"
                onClick={handleChangeWarmup}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                CHANGE WARM-UP (Slap the Board)
              </button>

              <button
                type="button"
                onClick={handleRemoveVideo}
                className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                REMOVE VIDEO
              </button>
            </div>
          </div>
        )}

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
          <h2 className="text-base font-bold text-[#1F4E78] uppercase mb-1">POST-REFLECTION</h2>
          <p className="text-xs text-slate-500 mb-2 italic font-sans">
            Write 2–3 short sentences: (1) What worked well, (2) What pupils found difficult, (3) Practical adjustment for next lesson.
          </p>
          <textarea
            rows={3}
            value={plan.post_reflection || ''}
            onChange={(e) => handleFieldChange('post_reflection', e.target.value)}
            placeholder="e.g. Pupils participated actively in the pair-work activity and used the target sentence pattern confidently. Some pupils still had difficulty pronouncing the new words. More pronunciation practice should be provided next time."
            className="w-full border border-slate-300 rounded p-2 text-xs font-sans text-slate-900"
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
