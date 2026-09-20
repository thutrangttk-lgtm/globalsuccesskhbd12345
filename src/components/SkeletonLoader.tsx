import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-slate-800 border border-slate-700/50 rounded-xl p-6">
          <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700/60 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-700/40 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
