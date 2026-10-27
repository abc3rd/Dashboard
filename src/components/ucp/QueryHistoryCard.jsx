import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import ModelBadge from './ModelBadge';
import ConfidenceMeter from './ConfidenceMeter';

// Mobile counterpart to a history table row: one stacked card per query,
// tapping the header reveals the full prompt and answer.
export default function QueryHistoryCard({ query }) {
  const [expanded, setExpanded] = useState(false);

  const truncatedPrompt = query.prompt?.length > 80
    ? query.prompt.slice(0, 80) + '...'
    : query.prompt;

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full text-left px-4 pt-3 pb-2 min-h-[44px] hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center justify-between gap-2 mb-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(query.created_date), 'MMM d, HH:mm')}
          </span>
          <span className="flex items-center gap-2 text-xs text-slate-600">
            {query.latency_ms}ms
            {expanded
              ? <ChevronUp className="w-4 h-4 text-slate-400" />
              : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </span>
        </span>
        <span className="block text-sm text-slate-700 break-words">{truncatedPrompt}</span>
      </button>

      <div className="flex items-center gap-3 px-4 pb-3">
        <ModelBadge modelId={query.chosen_model} size="small" />
        <div className="flex-1 min-w-0">
          <ConfidenceMeter value={query.confidence || 0} showLabel={false} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-4 bg-slate-50 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Full Prompt
            </h4>
            <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border break-words">
              {query.prompt}
            </p>
          </div>
          {query.answer && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Response
              </h4>
              <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border whitespace-pre-wrap break-words">
                {query.answer}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}