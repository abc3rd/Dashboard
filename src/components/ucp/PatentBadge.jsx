import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PatentBadge({ variant = 'default', className }) {
  const variants = {
    default: 'text-xs text-slate-500',
    footer: 'text-xs text-slate-400',
    prominent: 'text-sm text-slate-600 font-medium'
  };

  return (
    <div className={cn('flex items-center gap-1.5', variants[variant], className)}>
      <Shield className="w-3 h-3" />
      <span>Powered by UCP — Patent Pending (Application No. 63/928,882) — Omega UI, LLC</span>
    </div>
  );
}