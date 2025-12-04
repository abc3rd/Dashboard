import React from 'react';
import { cn } from '@/lib/utils';

export default function ConfidenceMeter({ value, showLabel = true }) {
  const percentage = Math.round(value * 100);
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="text-sm text-slate-500 font-medium min-w-[80px]">
          Confidence
        </span>
      )}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-700 min-w-[45px] text-right">
          {percentage}%
        </span>
      </div>
    </div>
  );
}