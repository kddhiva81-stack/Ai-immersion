import React from 'react';
import { GradeLetter } from '../../types';
import { getGradeColor } from '../../utils/calculations';

interface GradeBadgeProps {
  grade: GradeLetter;
  size?: 'sm' | 'md' | 'lg';
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, size = 'md' }) => {
  const color = getGradeColor(grade);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3 py-1.5 text-sm font-black tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border ${color.bg} ${color.border} ${sizeClasses}`}
    >
      Grade {grade}
    </span>
  );
};

interface StatusBadgeProps {
  status: 'Passed' | 'Failed';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isPass = status === 'Passed';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${
        isPass
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
      {status}
    </span>
  );
};
