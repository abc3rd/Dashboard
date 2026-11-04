import { useMemo } from 'react';
import { subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Brain, Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

// Summary of model usage + performance over the last 7 days. Logs passed in
// are already RLS-scoped to the current user (admins see all), so the chart
// respects per-user data boundaries — no shared/team-wide view is ever shown.
const MODEL_META = {
  fast_model: { label: 'Fast Model', color: '#c3c3c3', Icon: Zap },
  smart_model: { label: 'Smart Model', color: '#31509c', Icon: Brain },
};
const FALLBACK_COLOR = '#7c8db5';

export default function ModelUsageSummary({ logs = [] }) {
  const stats = useMemo(() => {
    const since = subDays(new Date(), 7);
    const week = logs.filter((l) => new Date(l.created_date) >= since);

    const byModel = {};
    week.forEach((l) => {
      const m = l.chosen_model || 'unknown';
      if (!byModel[m]) byModel[m] = { count: 0, latency: 0, confidence: 0 };
      byModel[m].count++;
      byModel[m].latency += l.latency_ms || 0;
      byModel[m].confidence += l.confidence || 0;
    });

    const rows = Object.entries(byModel)
      .map(([model, d]) => ({
        model,
        label: MODEL_META[model]?.label || model,
        count: d.count,
        avgLatency: d.count ? Math.round(d.latency / d.count) : 0,
        avgConfidence: d.count ? Math.round((d.confidence / d.count) * 100) / 100 : 0,
        color: MODEL_META[model]?.color || FALLBACK_COLOR,
      }))
      .sort((a, b) => b.count - a.count);

    const total = week.length;
    return { rows, total };
  }, [logs]);

  const { rows, total } = stats;

  return (
    <Card className="border-0 shadow-md mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cpu className="w-5 h-5 text-brand" />
          Model Usage — Last 7 Days
        </CardTitle>
        <CardDescription>
          How often each model was used and how it performed this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No queries in the last 7 days yet.
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => [`${value} queries`, 'Usage']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {rows.map((r) => (
                      <Cell key={r.model} fill={r.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {rows.map((r) => {
                const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                return (
                  <div
                    key={r.model}
                    className="p-3 rounded-xl border border-border bg-muted/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: r.color }}
                          aria-hidden="true"
                        />
                        {r.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {r.count} ({pct}%)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Avg latency: <span className="font-medium text-foreground">{r.avgLatency}ms</span></span>
                      <span>Avg confidence: <span className="font-medium text-foreground">{r.avgConfidence}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}