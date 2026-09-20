import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "CURRICULUM DATA HAS NOT BEEN IMPORTED YET.",
  message = "No verified source records exist in the database for this selection. You can create a lesson plan using Custom Mode or upload source documents.",
  actionText,
  onAction
}) => {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center my-6 max-w-2xl mx-auto">
      <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-amber-300 tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto mb-6">
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm inline-flex items-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
