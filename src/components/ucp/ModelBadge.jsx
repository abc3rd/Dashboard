import React from 'react';
import { Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModelBadge({ modelId, size = 'default' }) {
  const isFast = modelId === 'fast_model';
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs gap-1',
    default: 'px-3 py-1.5 text-sm gap-1.5',
    large: 'px-4 py-2 text-base gap-2'
  };
  
  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-all',
        sizeClasses[size],
        isFast
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-violet-50 text-violet-700 border border-violet-200'
      )}
    >
      {isFast ? (
        <Zap className={cn(iconSizes[size], 'text-amber-500')} />
      ) : (
        <Brain className={cn(iconSizes[size], 'text-violet-500')} />
      )}
      <span>{isFast ? 'Fast Model' : 'Smart Model'}</span>
    </div>
  );
}