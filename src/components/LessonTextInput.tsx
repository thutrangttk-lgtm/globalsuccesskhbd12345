import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { parsePastedText } from '../utils/sourceParser';
import type { ExtractedLessonInfo } from '../types';

interface LessonTextInputProps {
  onExtracted: (info: ExtractedLessonInfo) => void;
}

export const LessonTextInput: React.FC<LessonTextInputProps> = ({ onExtracted }) => {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const extracted = parsePastedText(text);
      onExtracted(extracted);
      setAnalyzing(false);
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <FileText className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Dán Nội Dung Bài Học (Paste Lesson Content)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Paste textbook content, lesson dialogues, vocabulary lists, or teacher notes copied from Word, PDF, or websites.
      </p>

      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste lesson text here... (e.g. Unit 3: My Family - Lesson 1. Vocabulary: mother, father, brother...)"
        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 mb-4"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!text.trim() || analyzing}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{analyzing ? 'Analyzing Text...' : 'Analyze Pasted Content'}</span>
        </button>
      </div>
    </div>
  );
};
