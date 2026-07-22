import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Brain, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RoutingBreakdown({ packet }) {
  if (!packet) {
    return (
      <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
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
      : 'bg-brand/15 text-brand border-brand/20';
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
    <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand" />
          <CardTitle className="text-lg">Live Routing Breakdown</CardTitle>
        </div>
        <CardDescription>
          Current rules derived from the UCP Packet
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
              className="flex items-center gap-3 p-4 bg-muted rounded-xl border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {conditions.map((cond, i) => (
                    <Badge key={i} variant="outline" className="bg-card">
                      {cond}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              
              <Badge className={cn('gap-1.5', getModelColor(rule.choose_model))}>
                <ModelIcon className="w-3.5 h-3.5" />
                {rule.choose_model}
              </Badge>
            </div>
          );
        })}

        {/* Fallback */}
        {fallback && (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border-2 border-dashed border-border">
            <div className="w-8 h-8 rounded-lg bg-muted-foreground/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Fallback (no rules match)</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            
            <Badge className={cn('gap-1.5', getModelColor(fallback))}>
              {fallback === 'fast_model' ? <Zap className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
              {fallback}
            </Badge>
          </div>
        )}

        {/* Models Summary */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Available Models</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {models?.map((model) => (
              <div 
                key={model.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted"
              >
                {model.id === 'fast_model' ? (
                  <Zap className="w-4 h-4 text-amber-500" />
                ) : (
                  <Brain className="w-4 h-4 text-brand" />
                )}
                <span className="text-sm font-medium text-card-foreground">{model.id}</span>
                <span className="text-xs text-muted-foreground ml-auto">
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