import React from 'react';
import { Sliders } from 'lucide-react';

interface TeacherInstructionsProps {
  value: string;
  onChange: (val: string) => void;
}

export const TeacherInstructions: React.FC<TeacherInstructionsProps> = ({ value, onChange }) => {
  const samplePills = [
    "Focus more on speaking.",
    "Add pair work.",
    "Add group work.",
    "Add pronunciation practice.",
    "Simplify for weaker pupils.",
    "Create a 35-minute lesson.",
    "Integrate NLS if appropriate.",
    "Do not add unnecessary integrations."
  ];

  const handleAddSample = (text: string) => {
    if (value.includes(text)) return;
    const newText = value ? `${value}\n- ${text}` : `- ${text}`;
    onChange(newText);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Yêu Cầu Riêng Của Giáo Viên (Teacher's Special Instructions)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Specify pedagogical focus, grouping strategies, differentiation, or duration constraints. The generator will apply these instructions cleanly.
      </p>

      {/* Quick pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {samplePills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handleAddSample(pill)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-3 py-1 rounded-full transition-colors"
          >
            + {pill}
          </button>
        ))}
      </div>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="- Focus more on speaking in pairs.&#10;- Add pronunciation activity for new words.&#10;- Keep writing task short."
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};
