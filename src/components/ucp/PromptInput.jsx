import React from 'react';
import { Send, Loader2, Zap, Brain, Shield } from 'lucide-react';
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

      {/* Dynamic Routing Indicator */}
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
        charCount < threshold 
          ? "bg-amber-50 border-amber-200" 
          : "bg-violet-50 border-violet-200"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          charCount < threshold ? "bg-amber-100" : "bg-violet-100"
        )}>
          {charCount < threshold ? (
            <Zap className="w-5 h-5 text-amber-600" />
          ) : (
            <Brain className="w-5 h-5 text-violet-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold",
              charCount < threshold ? "text-amber-700" : "text-violet-700"
            )}>
              {charCount < threshold ? "Fast Model" : "Smart Model"}
            </span>
            <span className={cn(
              "text-sm",
              charCount < threshold ? "text-amber-600" : "text-violet-600"
            )}>
              ({charCount} characters)
            </span>
          </div>
          <p className={cn(
            "text-xs",
            charCount < threshold ? "text-amber-600" : "text-violet-600"
          )}>
            {charCount < threshold 
              ? `Prompts under ${threshold} chars route to Fast Model`
              : `Prompts ≥${threshold} chars route to Smart Model`
            }
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3 h-3 text-violet-500" />
          <span>Routing logic derived from UCP Packet (Patent Pending)</span>
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
        Press ⌘+Enter to submit
      </p>
    </div>
  );
}