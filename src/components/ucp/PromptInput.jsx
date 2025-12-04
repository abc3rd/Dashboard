import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function PromptInput({ value, onChange, onSubmit, isLoading, placeholder }) {
  const charCount = value.length;
  const threshold = 100;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your question here..."}
          className={cn(
            "min-h-[140px] resize-none pr-4 text-base leading-relaxed",
            "border-slate-200 focus:border-slate-300 focus:ring-slate-200",
            "placeholder:text-slate-400"
          )}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              charCount >= threshold ? "text-violet-600" : "text-amber-600"
            )}
          >
            {charCount} characters
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-sm text-slate-500">
            {charCount < threshold ? (
              <>Routes to <span className="font-medium text-amber-600">Fast Model</span></>
            ) : (
              <>Routes to <span className="font-medium text-violet-600">Smart Model</span></>
            )}
          </span>
        </div>

        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Ask
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-400">
        Press ⌘+Enter to submit • Prompts under {threshold} chars use the fast model
      </p>
    </div>
  );
}