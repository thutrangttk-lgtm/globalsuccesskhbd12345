import React from 'react';
import type { CurriculumUnit } from '../types';

interface UnitSelectorProps {
  units: CurriculumUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
  loading?: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  loading
}) => {
  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        Select Curriculum Unit
      </label>
      {loading ? (
        <div className="h-10 bg-slate-800 animate-pulse rounded-lg w-full"></div>
      ) : units.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-slate-400 text-sm italic">
          No units available for this grade. Please check database sources.
        </div>
      ) : (
        <select
          value={selectedUnitId || ''}
          onChange={(e) => onSelectUnit(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="" disabled>-- Choose a Unit --</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              Unit {unit.unit_number}: {unit.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
