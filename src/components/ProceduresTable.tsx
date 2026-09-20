import React from 'react';
import type { ProcedureRow } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface ProceduresTableProps {
  procedures: ProcedureRow[];
  onChange: (updated: ProcedureRow[]) => void;
  editable?: boolean;
}

export const ProceduresTable: React.FC<ProceduresTableProps> = ({
  procedures,
  onChange,
  editable = true
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

  return (
    <div className="w-full overflow-x-auto my-4 border border-slate-700 rounded-xl bg-slate-900 shadow-md">
      <table className="w-full text-left border-collapse text-sm">
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
          {procedures.map((row, idx) => (
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
                    <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-0.5">Expected Outcome:</p>
                    <p className="text-xs text-slate-200 mb-3">{row.expectedOutcome}</p>

                    <p className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-0.5">Evidence:</p>
                    <p className="text-xs text-slate-200 mb-2">{row.evidence}</p>

                    {row.integrationCode && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          Integration: {row.integrationCode}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </td>

              {/* Column 3: Post-Lesson Adjustments */}
              <td className="p-4 align-top">
                {editable ? (
                  <textarea
                    rows={4}
                    value={row.postLessonAdjustments || ''}
                    onChange={(e) => handleUpdateRow(idx, 'postLessonAdjustments', e.target.value)}
                    placeholder="Leave BLANK when creating new..."
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300"
                  />
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {row.postLessonAdjustments || '(To be completed after teaching)'}
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
          ))}
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
