import React from 'react';
import { Loader2 } from 'lucide-react';

// Mobile counterpart to the table's optimistic "routing…" row.
export default function PendingQueryCard({ prompt }) {
  return (
    <div className="px-4 py-3 border-b border-slate-100 bg-brand/5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="flex items-center gap-1.5 text-xs text-brand font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Now
        </span>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
      </div>
      <p className="text-sm text-foreground break-words">{prompt}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground italic">routing…</span>
        <div className="flex-1 h-2 rounded-full bg-muted animate-pulse" />
      </div>
    </div>
  );
}