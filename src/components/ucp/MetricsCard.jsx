import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Zap, Brain, Clock, DollarSign, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MetricsCard() {
  const { data: queries = [] } = useQuery({
    queryKey: ['allQueryLogs'],
    queryFn: () => base44.entities.QueryLog.list('-created_date', 1000),
  });

  // Calculate metrics
  const totalQueries = queries.length;
  const fastQueries = queries.filter(q => q.chosen_model === 'fast_model');
  const smartQueries = queries.filter(q => q.chosen_model === 'smart_model');
  
  const fastCount = fastQueries.length;
  const smartCount = smartQueries.length;
  
  const fastPercent = totalQueries > 0 ? Math.round((fastCount / totalQueries) * 100) : 0;
  const smartPercent = totalQueries > 0 ? Math.round((smartCount / totalQueries) * 100) : 0;
  
  const avgFastLatency = fastCount > 0 
    ? Math.round(fastQueries.reduce((sum, q) => sum + (q.latency_ms || 0), 0) / fastCount)
    : 0;
  const avgSmartLatency = smartCount > 0 
    ? Math.round(smartQueries.reduce((sum, q) => sum + (q.latency_ms || 0), 0) / smartCount)
    : 0;

  // Cost savings calculation
  // Smart Model = cost index 1.0, Fast Model = cost index 0.3
  const baselineCost = totalQueries * 1.0;
  const actualCost = fastCount * 0.3 + smartCount * 1.0;
  const savingsPercent = baselineCost > 0 
    ? Math.round((1 - actualCost / baselineCost) * 100) 
    : 0;

  const metrics = [
    {
      label: 'Total Queries',
      value: totalQueries,
      icon: TrendingUp,
      color: 'text-slate-700'
    },
    {
      label: 'Fast Model Usage',
      value: `${fastPercent}%`,
      subValue: `${fastCount} queries`,
      icon: Zap,
      color: 'text-amber-600'
    },
    {
      label: 'Smart Model Usage',
      value: `${smartPercent}%`,
      subValue: `${smartCount} queries`,
      icon: Brain,
      color: 'text-violet-600'
    },
    {
      label: 'Avg Latency (Fast)',
      value: `${avgFastLatency}ms`,
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      label: 'Avg Latency (Smart)',
      value: `${avgSmartLatency}ms`,
      icon: Clock,
      color: 'text-violet-600'
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600" />
          <CardTitle className="text-lg">UCP Routing Metrics (Patent Pending)</CardTitle>
        </div>
        <CardDescription>
          Real-time analytics from deterministic UCP routing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="bg-slate-50 rounded-xl p-3 border border-slate-100"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <metric.icon className={cn('w-4 h-4', metric.color)} />
                <span className="text-xs text-slate-500 truncate">{metric.label}</span>
              </div>
              <p className={cn('text-xl font-bold', metric.color)}>{metric.value}</p>
              {metric.subValue && (
                <p className="text-xs text-slate-400">{metric.subValue}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cost Savings Highlight */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 mb-1">
                Estimated Compute Savings: {savingsPercent}%
              </h4>
              <p className="text-sm text-emerald-700">
                vs always using the Smart Model (via UCP deterministic routing)
              </p>
              <p className="text-xs text-emerald-600 mt-2 italic">
                These savings represent the core value of UCP's interpret-once, execute-many design.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}