import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface ProgramCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  theme: 'teal' | 'blue' | 'orange' | 'pink';
  illustrationUrl?: string;
  onClick: () => void;
}

const themeStyles = {
  teal: {
    cardBorder: 'border-[#e0f0ee] hover:border-[#14b8a6]',
    iconBg: 'bg-[#ccfbf1] text-[#0d9488]',
    badgeBg: 'bg-[#e6f7f5] text-[#0d9488]',
    titleColor: 'text-[#0f766e]',
    subtitleColor: 'text-[#14b8a6]',
    btnBg: 'bg-[#0d9488] hover:bg-[#0f766e] shadow-teal-700/20'
  },
  blue: {
    cardBorder: 'border-[#e0f0ee] hover:border-[#3b82f6]',
    iconBg: 'bg-[#dbeafe] text-[#1d4ed8]',
    badgeBg: 'bg-[#eff6ff] text-[#1e40af]',
    titleColor: 'text-[#1d4ed8]',
    subtitleColor: 'text-[#3b82f6]',
    btnBg: 'bg-[#2563eb] hover:bg-[#1d4ed8] shadow-blue-700/20'
  },
  orange: {
    cardBorder: 'border-[#e0f0ee] hover:border-[#f97316]',
    iconBg: 'bg-[#ffedd5] text-[#c2410c]',
    badgeBg: 'bg-[#fff7ed] text-[#c2410c]',
    titleColor: 'text-[#ea580c]',
    subtitleColor: 'text-[#f97316]',
    btnBg: 'bg-[#f97316] hover:bg-[#ea580c] shadow-orange-700/20'
  },
  pink: {
    cardBorder: 'border-[#e0f0ee] hover:border-[#f43f5e]',
    iconBg: 'bg-[#ffe4e6] text-[#be123c]',
    badgeBg: 'bg-[#fff1f2] text-[#be123c]',
    titleColor: 'text-[#e11d48]',
    subtitleColor: 'text-[#f43f5e]',
    btnBg: 'bg-[#f43f5e] hover:bg-[#e11d48] shadow-rose-700/20'
  }
};

export const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  theme,
  illustrationUrl,
  onClick
}) => {
  const styles = themeStyles[theme] || themeStyles.teal;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border ${styles.cardBorder} rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
    >
      <div>
        {/* Top Icon & Badge Header */}
        <div className="flex items-center justify-between mb-5">
          <div className={`p-3.5 rounded-2xl ${styles.iconBg} shadow-xs group-hover:scale-105 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${styles.badgeBg}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className={`text-xl font-black ${styles.titleColor} tracking-wide mb-1 leading-snug`}>
          {title}
        </h3>
        <p className={`text-[11px] font-extrabold ${styles.subtitleColor} tracking-wider uppercase mb-3`}>
          {subtitle}
        </p>

        {/* Description Text */}
        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Button & Bottom Illustration */}
      <div className="mt-8 flex items-end justify-between relative">
        <button
          type="button"
          className={`${styles.btnBg} text-white font-bold text-xs px-4 py-2.5 rounded-full inline-flex items-center space-x-1.5 shadow-md transition-all group-hover:scale-105`}
        >
          <span>Start Creating</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {illustrationUrl && (
          <div className="w-16 h-14 relative opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
            <img
              src={illustrationUrl}
              alt="Decoration"
              className="w-full h-full object-contain object-bottom"
            />
          </div>
        )}
      </div>

    </div>
  );
};
