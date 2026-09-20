import React from 'react';
import type { ExtractedLessonInfo } from '../types';

interface CustomLessonFormProps {
  formData: ExtractedLessonInfo;
  onChange: (updated: ExtractedLessonInfo) => void;
}

export const CustomLessonForm: React.FC<CustomLessonFormProps> = ({ formData, onChange }) => {
  const handleChange = (field: keyof ExtractedLessonInfo, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleArrayChange = (field: 'vocabulary' | 'sentencePatterns' | 'skills' | 'activities', rawText: string) => {
    const list = rawText.split('\n').map(item => item.trim()).filter(Boolean);
    onChange({ ...formData, [field]: list });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
      <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
        Lesson Information (Thông Tin Bài Học)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Grade Level
          </label>
          <select
            value={formData.gradeLevel || 3}
            onChange={(e) => handleChange('gradeLevel', parseInt(e.target.value, 10))}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5].map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Topic / Unit Title
          </label>
          <input
            type="text"
            value={formData.unitTitle || ''}
            onChange={(e) => handleChange('unitTitle', e.target.value)}
            placeholder="e.g. Unit 1: Hello"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            value={formData.lessonTitle || ''}
            onChange={(e) => handleChange('lessonTitle', e.target.value)}
            placeholder="e.g. Lesson 1 - Look, listen and repeat"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Target Vocabulary (One per line)
          </label>
          <textarea
            rows={4}
            value={(formData.vocabulary || []).join('\n')}
            onChange={(e) => handleArrayChange('vocabulary', e.target.value)}
            placeholder="e.g. hello&#10;goodbye&#10;friend"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Target Sentence Patterns (One per line)
          </label>
          <textarea
            rows={4}
            value={(formData.sentencePatterns || []).join('\n')}
            onChange={(e) => handleArrayChange('sentencePatterns', e.target.value)}
            placeholder="e.g. How are you? - I'm fine, thank you.&#10;What is your name?"
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Desired Activities (One per line)
        </label>
        <textarea
          rows={3}
          value={(formData.activities || []).join('\n')}
          onChange={(e) => handleArrayChange('activities', e.target.value)}
          placeholder="e.g. Activity 1: Look, listen and repeat&#10;Activity 2: Listen, point and say"
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};
