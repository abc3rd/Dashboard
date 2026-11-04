import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Activity, TrendingUp, DollarSign, AlertTriangle, 
  Clock, Zap, Brain, RefreshCw, Calendar,
  ChevronDown, Bell, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveSelect from '@/components/ucp/ResponsiveSelect';
import PullToRefresh from '@/components/ucp/PullToRefresh';
import { isFallbackQuery, getFallbackModel } from '@/lib/fallbackDetection';
import ModelUsageSummary from '@/components/ucp/ModelUsageSummary';
import { cn } from '@/lib/utils';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';

// Cost per query by model (simulated pricing)
const MODEL_COSTS = {
  fast_model: 0.0001,
  smart_model: 0.003
};

export default function PerformanceMonitoring() {
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alerts, setAlerts] = useState([]);

  // Fetch all query logs
  const { data: queryLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['performanceLogs', timeRange],
    queryFn: () => base44.entities.QueryLog.list('-created_date', 500),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Active router packet — admin-only read. When unavailable (non-admin or none
  // configured), fallback analysis is skipped rather than shown with no signal.
  const { data: routerPacket = null } = useQuery({
    queryKey: ['activeRouterPacket'],
    queryFn: () => base44.entities.RouterPacket.list('-created_date', 1).then((p) => p[0] || null),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Process metrics from query logs
  const metrics = React.useMemo(() => {
    if (!queryLogs.length) return null;

    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '1h': startDate = subHours(now, 1); break;
      case '24h': startDate = subHours(now, 24); break;
      case '7d': startDate = subDays(now, 7); break;
      case '30d': startDate = subDays(now, 30); break;
      default: startDate = subHours(now, 24);
    }

    const filteredLogs = queryLogs.filter(log => 
      new Date(log.created_date) >= startDate
    );

    // Queries where no selection rule matched and the router fell back to the
    // default model — re-evaluated client-side from the active packet's rules.
    const fallbackModel = getFallbackModel(routerPacket);
    const fallbackQueries = filteredLogs.filter((log) => isFallbackQuery(routerPacket, log.prompt));

    // Group by time intervals
    const intervalMs = timeRange === '1h' ? 5 * 60 * 1000 : // 5 min intervals
                       timeRange === '24h' ? 60 * 60 * 1000 : // 1 hour intervals
                       timeRange === '7d' ? 24 * 60 * 60 * 1000 : // 1 day intervals
                       24 * 60 * 60 * 1000; // 1 day intervals

    const timeSeriesMap = new Map();
    
    filteredLogs.forEach(log => {
      const timestamp = Math.floor(new Date(log.created_date).getTime() / intervalMs) * intervalMs;
      if (!timeSeriesMap.has(timestamp)) {
        timeSeriesMap.set(timestamp, {
          timestamp,
          queries: 0,
          fastQueries: 0,
          smartQueries: 0,
          totalLatency: 0,
          fastLatency: 0,
          smartLatency: 0,
          errors: 0
        });
      }
      const bucket = timeSeriesMap.get(timestamp);
      bucket.queries++;
      bucket.totalLatency += log.latency_ms || 0;
      
      if (log.chosen_model === 'fast_model') {
        bucket.fastQueries++;
        bucket.fastLatency += log.latency_ms || 0;
      } else {
        bucket.smartQueries++;
        bucket.smartLatency += log.latency_ms || 0;
      }
      
      if (log.confidence < 0.5) bucket.errors++;
    });

    const timeSeries = Array.from(timeSeriesMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(bucket => ({
        ...bucket,
        time: format(new Date(bucket.timestamp), timeRange === '1h' ? 'HH:mm' : timeRange === '24h' ? 'HH:mm' : 'MMM dd'),
        avgLatency: bucket.queries > 0 ? Math.round(bucket.totalLatency / bucket.queries) : 0,
        avgFastLatency: bucket.fastQueries > 0 ? Math.round(bucket.fastLatency / bucket.fastQueries) : 0,
        avgSmartLatency: bucket.smartQueries > 0 ? Math.round(bucket.smartLatency / bucket.smartQueries) : 0,
      }));

    // Calculate totals
    const totalQueries = filteredLogs.length;
    const fastQueries = filteredLogs.filter(l => l.chosen_model === 'fast_model').length;
    const smartQueries = filteredLogs.filter(l => l.chosen_model === 'smart_model').length;
    
    const avgLatency = totalQueries > 0 
      ? Math.round(filteredLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / totalQueries)
      : 0;
    
    const avgFastLatency = fastQueries > 0
      ? Math.round(filteredLogs.filter(l => l.chosen_model === 'fast_model').reduce((sum, l) => sum + (l.latency_ms || 0), 0) / fastQueries)
      : 0;
    
    const avgSmartLatency = smartQueries > 0
      ? Math.round(filteredLogs.filter(l => l.chosen_model === 'smart_model').reduce((sum, l) => sum + (l.latency_ms || 0), 0) / smartQueries)
      : 0;

    // Cost calculation
    const fastCost = fastQueries * MODEL_COSTS.fast_model;
    const smartCost = smartQueries * MODEL_COSTS.smart_model;
    const totalCost = fastCost + smartCost;
    
    // What it would cost if all queries went to smart model
    const wouldCostSmart = totalQueries * MODEL_COSTS.smart_model;
    const savings = wouldCostSmart - totalCost;
    const savingsPercent = wouldCostSmart > 0 ? (savings / wouldCostSmart) * 100 : 0;

    return {
      timeSeries,
      totalQueries,
      fastQueries,
      smartQueries,
      avgLatency,
      avgFastLatency,
      avgSmartLatency,
      fastCost,
      smartCost,
      totalCost,
      savings,
      savingsPercent,
      fallbackModel,
      fallbackQueries,
      modelDistribution: [
        { name: 'Fast Model', value: fastQueries, color: '#c3c3c3' },
        { name: 'Smart Model', value: smartQueries, color: '#31509c' }
      ]
    };
  }, [queryLogs, timeRange, routerPacket]);

  // Detect anomalies and generate alerts
  useEffect(() => {
    if (!metrics || !metrics.timeSeries.length) return;

    const newAlerts = [];
    const recentBuckets = metrics.timeSeries.slice(-5);
    const olderBuckets = metrics.timeSeries.slice(0, -5);

    if (olderBuckets.length > 0) {
      const avgOldLatency = olderBuckets.reduce((sum, b) => sum + b.avgLatency, 0) / olderBuckets.length;
      const recentAvgLatency = recentBuckets.reduce((sum, b) => sum + b.avgLatency, 0) / recentBuckets.length;
      
      if (recentAvgLatency > avgOldLatency * 1.5 && recentAvgLatency > 100) {
        newAlerts.push({
          id: 'latency-spike',
          type: 'warning',
          title: 'Latency Spike Detected',
          message: `Average latency increased by ${Math.round((recentAvgLatency / avgOldLatency - 1) * 100)}% recently`,
          time: new Date()
        });
      }

      const recentErrors = recentBuckets.reduce((sum, b) => sum + b.errors, 0);
      const recentTotal = recentBuckets.reduce((sum, b) => sum + b.queries, 0);
      const errorRate = recentTotal > 0 ? (recentErrors / recentTotal) * 100 : 0;
      
      if (errorRate > 10) {
        newAlerts.push({
          id: 'error-rate',
          type: 'error',
          title: 'High Error Rate',
          message: `${errorRate.toFixed(1)}% of recent queries had low confidence scores`,
          time: new Date()
        });
      }
    }

    setAlerts(newAlerts);
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <PullToRefresh onRefresh={() => refetch()}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Performance Monitoring</h1>
              <p className="text-sm text-muted-foreground">Real-time routing analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ResponsiveSelect
              value={timeRange}
              onValueChange={setTimeRange}
              triggerClassName="w-36"
              triggerIcon={<Calendar className="w-4 h-4 mr-2 shrink-0" />}
              title="Time Range"
              options={[
                { value: '1h', label: 'Last Hour' },
                { value: '24h', label: 'Last 24h' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' }
              ]}
            />

            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(autoRefresh && "bg-brand hover:bg-brand-dark")}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")} />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map(alert => (
              <Card key={alert.id} className={cn(
                "border-l-4",
                alert.type === 'error' ? "border-l-red-500 bg-red-50 dark:bg-red-950/40" : "border-l-amber-500 bg-amber-50 dark:bg-amber-950/40"
              )}>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={cn(
                    "w-5 h-5",
                    alert.type === 'error' ? "text-red-500" : "text-amber-500"
                  )} />
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      alert.type === 'error' ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
                    )}>{alert.title}</p>
                    <p className={cn(
                      "text-sm",
                      alert.type === 'error' ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                    )}>{alert.message}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {format(alert.time, 'HH:mm')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.totalQueries || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Queries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.avgLatency || 0}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">${metrics?.totalCost?.toFixed(4) || '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand">{metrics?.savingsPercent?.toFixed(0) || 0}%</p>
                  <p className="text-xs text-brand/80">Cost Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Default Model Fallback — prompts that matched no selection rule */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Default Model Fallback
            </CardTitle>
            <CardDescription>
              Queries where no selection rule matched and the router fell back to the default model
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!routerPacket ? (
              <p className="text-sm text-muted-foreground">
                Router packet unavailable. Only admins can view fallback analysis.
              </p>
            ) : (metrics?.fallbackQueries?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                No fallbacks in this range — every prompt matched a selection rule.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {metrics.fallbackQueries.slice(0, 50).map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground break-words line-clamp-2">{q.prompt}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{format(new Date(q.created_date), 'MMM d, HH:mm')}</span>
                        <span>•</span>
                        <span>Fell back to <span className="font-medium">{q.chosen_model}</span></span>
                        <span>•</span>
                        <span>{q.latency_ms}ms</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly model usage summary — visible regardless of selected time range */}
        <ModelUsageSummary logs={queryLogs} />

        <Tabs defaultValue="volume" className="space-y-6">
          <TabsList className="bg-muted border shadow-sm">
            <TabsTrigger value="volume">Query Volume</TabsTrigger>
            <TabsTrigger value="latency">Latency</TabsTrigger>
            <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="models">Model Usage</TabsTrigger>
          </TabsList>

          {/* Query Volume Chart */}
          <TabsContent value="volume">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Query Volume Over Time</CardTitle>
                <CardDescription>Number of queries processed per interval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.timeSeries || []}>
                      <defs>
                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#31509c" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#31509c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="queries" 
                        stroke="#31509c" 
                        fillOpacity={1} 
                        fill="url(#colorQueries)" 
                        name="Queries"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Latency Chart */}
          <TabsContent value="latency">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Latency by Model</CardTitle>
                <CardDescription>Average response time per model over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.timeSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} unit="ms" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="avgFastLatency" 
                        stroke="#c3c3c3" 
                        strokeWidth={2}
                        dot={false}
                        name="Fast Model"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgSmartLatency" 
                        stroke="#31509c" 
                        strokeWidth={2}
                        dot={false}
                        name="Smart Model"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-muted border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-card-foreground">Fast Model</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metrics?.avgFastLatency || 0}ms</p>
                    <p className="text-xs text-muted-foreground">Average latency</p>
                  </div>
                  <div className="p-4 rounded-xl bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-brand" />
                      <span className="font-medium text-brand">Smart Model</span>
                    </div>
                    <p className="text-2xl font-bold text-brand">{metrics?.avgSmartLatency || 0}ms</p>
                    <p className="text-xs text-brand/80 dark:text-brand/60">Average latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Breakdown */}
          <TabsContent value="costs">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                  <CardDescription>API costs by model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics?.modelDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(metrics?.modelDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>Detailed cost analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-card-foreground">Fast Model</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{metrics?.fastQueries || 0} queries</span>
                    </div>
                    <p className="text-xl font-bold text-foreground mt-2">${metrics?.fastCost?.toFixed(4) || '0.0000'}</p>
                    <p className="text-xs text-muted-foreground">@ ${MODEL_COSTS.fast_model}/query</p>
                  </div>

                  <div className="p-4 rounded-xl bg-brand/5 dark:bg-brand/10 border border-brand/20 dark:border-brand/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-brand" />
                        <span className="font-medium text-brand">Smart Model</span>
                      </div>
                      <span className="text-sm text-brand/80 dark:text-brand/60">{metrics?.smartQueries || 0} queries</span>
                    </div>
                    <p className="text-xl font-bold text-brand mt-2">${metrics?.smartCost?.toFixed(4) || '0.0000'}</p>
                    <p className="text-xs text-brand/80 dark:text-brand/60">@ ${MODEL_COSTS.smart_model}/query</p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-brand/15 to-brand/10 dark:from-brand/30 dark:to-brand/20 border border-brand/30 dark:border-brand/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-brand">Total Savings with UCP</span>
                      <CheckCircle className="w-5 h-5 text-brand" />
                    </div>
                    <p className="text-2xl font-bold text-brand mt-2">${metrics?.savings?.toFixed(4) || '0.0000'}</p>
                    <p className="text-xs text-brand/80 dark:text-brand/60">vs. using Smart Model for all queries</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Model Usage */}
          <TabsContent value="models">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Model Utilization Over Time</CardTitle>
                <CardDescription>Queries routed to each model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.timeSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="fastQueries" fill="#c3c3c3" name="Fast Model" stackId="a" />
                      <Bar dataKey="smartQueries" fill="#31509c" name="Smart Model" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </PullToRefresh>
    </div>
  );
}