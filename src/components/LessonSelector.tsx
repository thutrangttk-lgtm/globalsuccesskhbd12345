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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lessons.map((lesson) => {
            const isSelected = selectedLessonId === lesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onSelectLesson(lesson.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="text-xs text-blue-400 font-semibold mb-0.5">
                  Lesson {lesson.lesson_number} • {lesson.duration_minutes} mins
                </div>
                <div className="text-sm font-medium leading-snug">
                  {lesson.title}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
