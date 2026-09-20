import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ProgramCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  colorClass: string;
  onClick: () => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  colorClass,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colorClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3.5 rounded-xl ${colorClass} text-white shadow-md group-hover:scale-105 transition-transform`}>
            <Icon className="w-7 h-7" />
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 border border-slate-700">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs font-semibold text-blue-400/90 tracking-wide uppercase mb-3">
          {subtitle}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
        <span>Create Lesson Plan</span>
        <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
  );
};
