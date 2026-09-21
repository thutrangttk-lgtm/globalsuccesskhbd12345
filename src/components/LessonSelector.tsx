import React from 'react';
import type { Lesson } from '../types';

interface LessonSelectorProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  loading?: boolean;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  loading
}) => {
  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        Select Lesson
      </label>
      {loading ? (
        <div className="h-10 bg-slate-800 animate-pulse rounded-lg w-full"></div>
      ) : lessons.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-slate-400 text-sm italic">
          No lessons found for this unit.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {lessons.map((lesson) => {
            const isSelected = selectedLessonId === lesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                className={`py-3.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white font-extrabold shadow-md shadow-blue-500/30 scale-102'
                    : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white font-bold'
                }`}
              >
                <div className="text-sm tracking-wide">
                  Lesson {lesson.lesson_number}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

