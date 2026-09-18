import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  colorType?: 'percentage' | 'attendance' | 'neutral';
  customColor?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  colorType = 'percentage',
  customColor,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let barColor = 'bg-blue-600';

  if (customColor) {
    barColor = customColor;
  } else if (colorType === 'attendance') {
    if (percentage >= 85) barColor = 'bg-emerald-500';
    else if (percentage >= 75) barColor = 'bg-blue-500';
    else if (percentage >= 65) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  } else if (colorType === 'percentage') {
    if (percentage >= 80) barColor = 'bg-emerald-500';
    else if (percentage >= 60) barColor = 'bg-blue-500';
    else if (percentage >= 40) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses}`}>
        <div
          className={`${heightClasses} rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
