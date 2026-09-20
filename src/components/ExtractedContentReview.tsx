import React from 'react';
import type { ExtractedLessonInfo } from '../types';
import { CheckCircle } from 'lucide-react';

interface ExtractedContentReviewProps {
  info: ExtractedLessonInfo;
  onChange: (updated: ExtractedLessonInfo) => void;
}

export const ExtractedContentReview: React.FC<ExtractedContentReviewProps> = ({ info, onChange }) => {
  const handleChange = (field: keyof ExtractedLessonInfo, value: any) => {
    onChange({ ...info, [field]: value });
  };

  const handleArrayChange = (field: 'vocabulary' | 'sentencePatterns' | 'skills' | 'activities', rawText: string) => {
    const list = rawText.split('\n').map((item) => item.trim()).filter(Boolean);
    onChange({ ...info, [field]: list });
  };

  return (
    <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-emerald-800/60">
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-emerald-200">
          DETECTED LESSON INFORMATION (Nội dung bài học đã phân tích)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            Grade Level:
          </label>
          <select
            value={info.gradeLevel || 3}
            onChange={(e) => handleChange('gradeLevel', parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            Unit Title:
          </label>
          <input
            type="text"
            value={info.unitTitle || ''}
            onChange={(e) => handleChange('unitTitle', e.target.value)}
            className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            Lesson Title:
          </label>
          <input
            type="text"
            value={info.lessonTitle || ''}
            onChange={(e) => handleChange('lessonTitle', e.target.value)}
            className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            Detected Vocabulary (One per line):
          </label>
          <textarea
            rows={4}
            value={(info.vocabulary || []).join('\n')}
            onChange={(e) => handleArrayChange('vocabulary', e.target.value)}
            className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
            Detected Sentence Patterns (One per line):
          </label>
          <textarea
            rows={4}
            value={(info.sentencePatterns || []).join('\n')}
            onChange={(e) => handleArrayChange('sentencePatterns', e.target.value)}
            className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
          Detected Activities (One per line):
        </label>
        <textarea
          rows={3}
          value={(info.activities || []).join('\n')}
          onChange={(e) => handleArrayChange('activities', e.target.value)}
          className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-3 text-sm"
        />
      </div>
    </div>
  );
};
