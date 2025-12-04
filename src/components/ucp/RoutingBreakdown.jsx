import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Brain, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoutingBreakdown({ packet }) {
  if (!packet) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center text-slate-400">
          No routing packet loaded
        </CardContent>
      </Card>
    );
  }

  const { selection_policy, models } = packet;
  const rules = selection_policy?.rules || [];
  const fallback = selection_policy?.fallback_model;

  const getModelIcon = (modelId) => {
    return modelId === 'fast_model' ? Zap : Brain;
  };

  const getModelColor = (modelId) => {
    return modelId === 'fast_model' 
      ? 'bg-amber-100 text-amber-700 border-amber-200' 
      : 'bg-violet-100 text-violet-700 border-violet-200';
  };

  const formatCondition = (condition) => {
    const parts = [];
    
    if (condition.prompt_length_lt !== undefined) {
      parts.push(`Length < ${condition.prompt_length_lt} chars`);
    }
    if (condition.prompt_length_gte !== undefined) {
      parts.push(`Length ≥ ${condition.prompt_length_gte} chars`);
    }
    if (condition.contains_keywords?.length > 0) {
      parts.push(`Contains: "${condition.contains_keywords.join('", "')}"`);
    }
    
    return parts.length > 0 ? parts : ['No conditions'];
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600" />
          <CardTitle className="text-lg">Live Routing Breakdown</CardTitle>
        </div>
        <CardDescription>
          Current rules derived from the UCP Packet (Patent Pending)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rules */}
        {rules.map((rule, index) => {
          const ModelIcon = getModelIcon(rule.choose_model);
          const conditions = formatCondition(rule.condition);
          
          return (
            <div 
              key={index}
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {conditions.map((cond, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {cond}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              
              <Badge className={cn('gap-1.5', getModelColor(rule.choose_model))}>
                <ModelIcon className="w-3.5 h-3.5" />
                {rule.choose_model}
              </Badge>
            </div>
          );
        })}

        {/* Fallback */}
        {fallback && (
          <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
            <div className="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-slate-600" />
            </div>
            
            <div className="flex-1">
              <span className="text-sm text-slate-600">Fallback (no rules match)</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            
            <Badge className={cn('gap-1.5', getModelColor(fallback))}>
              {fallback === 'fast_model' ? <Zap className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              {fallback}
            </Badge>
          </div>
        )}

        {/* Models Summary */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3">Available Models</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {models?.map((model) => (
              <div 
                key={model.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50"
              >
                {model.id === 'fast_model' ? (
                  <Zap className="w-4 h-4 text-amber-500" />
                ) : (
                  <Brain className="w-4 h-4 text-violet-500" />
                )}
                <span className="text-sm font-medium text-slate-700">{model.id}</span>
                <span className="text-xs text-slate-400 ml-auto">
                  Cost: {model.costScore} | Quality: {model.qualityScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}