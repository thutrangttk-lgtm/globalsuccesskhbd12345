import React from 'react';

interface GradeSelectorProps {
  selectedGrade: number;
  onSelectGrade: (grade: number) => void;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({ selectedGrade, onSelectGrade }) => {
  const grades = [1, 2, 3, 4, 5];

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
        Select Grade Level
      </label>
      <div className="flex flex-wrap gap-2.5">
        {grades.map(grade => {
          const isSelected = selectedGrade === grade;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => onSelectGrade(grade)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-blue-600/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              Grade {grade}
            </button>
          );
        })}
      </div>
    </div>
  );
};
