import React from 'react';
import type { ProcedureRow, IntegrationItem } from '../types';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { generatePostLessonAdjustment } from '../utils/postLessonAdjustments';
import { isIntegrationProcedureRow, getCanonicalIntegrationCellContent } from '../utils/integrationTranslator';

interface ProceduresTableProps {
  procedures: ProcedureRow[];
  onChange: (updated: ProcedureRow[]) => void;
  editable?: boolean;
  vocabulary?: string[];
  sentencePatterns?: string[];
  integrations?: IntegrationItem[];
}

export const ProceduresTable: React.FC<ProceduresTableProps> = ({
  procedures,
  onChange,
  editable = true,
  vocabulary = [],
  sentencePatterns = [],
  integrations = []
}) => {
  const handleUpdateRow = (index: number, field: keyof ProcedureRow, value: any) => {
    const next = [...procedures];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const handleUpdateArrayField = (index: number, field: 'teacherActivities' | 'pupilActivities', text: string) => {
    const lines = text.split('\n');
    const next = [...procedures];
    next[index] = { ...next[index], [field]: lines };
    onChange(next);
  };

  const handleAddRow = () => {
    const newRow: ProcedureRow = {
      id: `proc_${Date.now()}`,
      stageName: 'New Activity',
      teacherActivities: ['Teacher gives instructions and models.'],
      pupilActivities: ['Pupils listen, observe, and practise.'],
      expectedOutcome: 'Pupils perform target language task accurately.',
      evidence: 'Pupils pronounce words and complete activity.',
      postLessonAdjustments: '' // BLANK by default
    };
    onChange([...procedures, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const next = procedures.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleToggleAdjustment = (idx: number, checked: boolean) => {
    const next = [...procedures];
    if (checked) {
      const generated = next[idx].postLessonAdjustments?.trim() || generatePostLessonAdjustment(
        next[idx].stageName,
        vocabulary,
        sentencePatterns,
        idx
      );
      next[idx] = { ...next[idx], postLessonAdjustments: generated };
    } else {
      next[idx] = { ...next[idx], postLessonAdjustments: '' };
    }
    onChange(next);
  };

  const handleRegenerateAdjustment = (idx: number) => {
    const next = [...procedures];
    const generated = generatePostLessonAdjustment(
      next[idx].stageName,
      vocabulary,
      sentencePatterns,
      Math.floor(Math.random() * 5) + 1
    );
    next[idx] = { ...next[idx], postLessonAdjustments: generated };
    onChange(next);
  };

  return (
    <div className="w-full overflow-x-auto my-4 border border-slate-700 rounded-xl bg-slate-900 shadow-md">
      <table className="w-full min-w-[700px] text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800 text-slate-200 border-b border-slate-700 font-bold">
            <th className="p-3.5 w-[43%] border-r border-slate-700 text-center">
              Learning Activities
            </th>
            <th className="p-3.5 w-[37%] border-r border-slate-700 text-center">
              Expected Outcomes & Evidence
            </th>
            <th className="p-3.5 w-[20%] text-center">
              Post-Lesson Adjustments
            </th>
            {editable && <th className="p-3.5 w-12 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-300">
          {procedures.map((row, idx) => {
            const hasAdjustment = Boolean(row.postLessonAdjustments && row.postLessonAdjustments.trim().length > 0);

            return (
              <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
                
                {/* Column 1: Learning Activities */}
                <td className="p-4 border-r border-slate-800 align-top space-y-3">
                  {editable ? (
                    <>
                      <input
                        type="text"
                        value={row.stageName}
                        onChange={(e) => handleUpdateRow(idx, 'stageName', e.target.value)}
                        placeholder="Stage (e.g. Warm-up, Presentation)"
                        className="w-full bg-slate-800 border border-slate-700 font-bold text-blue-400 px-3 py-1.5 rounded text-sm mb-2"
                      />
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Teacher's activities:</label>
                        <textarea
                          rows={3}
                          value={(row.teacherActivities || []).join('\n')}
                          onChange={(e) => handleUpdateArrayField(idx, 'teacherActivities', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                          placeholder="One activity per line..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Pupils' activities:</label>
                        <textarea
                          rows={3}
                          value={(row.pupilActivities || []).join('\n')}
                          onChange={(e) => handleUpdateArrayField(idx, 'pupilActivities', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                          placeholder="One activity per line..."
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="font-bold text-blue-400 mb-2">* {row.stageName}</h4>
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Teacher's activities:</p>
                      <ul className="list-disc list-inside text-xs space-y-1 mb-3 text-slate-200">
                        {(row.teacherActivities || []).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                      <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-1">Pupils' activities:</p>
                      <ul className="list-disc list-inside text-xs space-y-1 text-slate-200">
                        {(row.pupilActivities || []).map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>

                {/* Column 2: Expected Outcomes & Evidence */}
                <td className="p-4 border-r border-slate-800 align-top space-y-3">
                  {editable ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Expected Outcome:</label>
                        <textarea
                          rows={2}
                          value={row.expectedOutcome}
                          onChange={(e) => handleUpdateRow(idx, 'expectedOutcome', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Evidence:</label>
                        <textarea
                          rows={2}
                          value={row.evidence}
                          onChange={(e) => handleUpdateRow(idx, 'evidence', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-emerald-400 block mb-1">Integration Code / Label (optional):</label>
                        <input
                          type="text"
                          value={row.integrationCode || ''}
                          onChange={(e) => handleUpdateRow(idx, 'integrationCode', e.target.value)}
                          placeholder="e.g. NLS_1.1.2 or AI_2.1"
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-emerald-300 font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      {isIntegrationProcedureRow(row) ? (
                        <p className="text-xs text-slate-200">{getCanonicalIntegrationCellContent(row, integrations)}</p>
                      ) : (
                        <>
                          <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-0.5">Expected Outcome:</p>
                          <p className="text-xs text-slate-200 mb-3">{row.expectedOutcome}</p>

                          <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-0.5">Evidence:</p>
                          <p className="text-xs text-slate-200 mb-2">{row.evidence}</p>
                        </>
                      )}
                    </div>
                  )}
                </td>

                {/* Column 3: Post-Lesson Adjustments with Checkbox */}
                <td className="p-4 align-top space-y-2">
                  {editable ? (
                    <div className="space-y-2">
                      <label className="inline-flex items-center space-x-2 cursor-pointer select-none text-xs font-semibold text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={hasAdjustment}
                          onChange={(e) => handleToggleAdjustment(idx, e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                        />
                        <span>Add adjustment</span>
                      </label>

                      {hasAdjustment && (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            rows={3}
                            value={row.postLessonAdjustments}
                            onChange={(e) => handleUpdateRow(idx, 'postLessonAdjustments', e.target.value)}
                            placeholder="Short, realistic adjustment..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRegenerateAdjustment(idx)}
                            className="text-[11px] text-blue-400 hover:text-blue-300 font-sans inline-flex items-center space-x-1 cursor-pointer"
                            title="Suggest another adjustment for this stage"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Suggest alternative</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">
                      {row.postLessonAdjustments || ''}
                    </p>
                  )}
                </td>

                {editable && (
                  <td className="p-3 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete Activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {editable && (
        <div className="p-3 bg-slate-800/50 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teaching Procedure Stage</span>
          </button>
        </div>
      )}
    </div>
  );
};

