import React from 'react';
import type { CurriculumUnit } from '../types';

export interface SelectableUnitOption {
  id: string;
  unit_number?: number | null;
  title: string;
  item_type?: string;
  displayLabel?: string;
}

interface UnitSelectorProps {
  units: (CurriculumUnit | SelectableUnitOption)[];
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
        Select Curriculum Unit / Section
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
          <option value="" disabled>-- Choose a Unit / Section --</option>
          {units.map((unit) => {
            let label = '';
            if ('displayLabel' in unit && unit.displayLabel) {
              label = unit.displayLabel;
            } else if (unit.unit_number) {
              const cleanTitle = unit.title.replace(/^(unit\s*\d+[:\s]*)+/i, '').trim();
              label = `Unit ${unit.unit_number}: ${cleanTitle}`;
            } else {
              label = unit.title;
            }

            return (
              <option key={unit.id} value={unit.id}>
                {label}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
};

