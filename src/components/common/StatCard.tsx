import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'blue',
  id,
}) => {
  const themeClasses = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'border-slate-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      border: 'border-slate-200',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'border-slate-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600',
      border: 'border-slate-200',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      border: 'border-slate-200',
    },
  }[colorTheme];

  return (
    <div
      id={id}
      className={`bg-white rounded-xl border ${themeClasses.border} p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${themeClasses.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
          {trend && (
            <span
              className={`font-semibold flex items-center ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
