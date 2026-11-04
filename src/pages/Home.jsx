import React, { useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PromptInput from '@/components/ucp/PromptInput';
// The answer card carries the markdown renderer, which isn't needed until an
// answer exists — splitting it keeps it out of the first load.
const loadAnswerCard = () => import('@/components/ucp/AnswerCard');
const AnswerCard = lazy(loadAnswerCard);
import UcpStatusBadge from '@/components/ucp/UcpStatusBadge';
import MetricsCard from '@/components/ucp/MetricsCard';
import QueryHistoryTable from '@/components/ucp/QueryHistoryTable';
import PullToRefresh from '@/components/ucp/PullToRefresh';
import PageLoadingSpinner from '@/components/PageLoadingSpinner';
import { UcpRouterService } from '@/components/ucp/UcpService';
import { useSubscription, useDailyQueryCount, FREE_DAILY_LIMIT } from '@/hooks/useSubscription';
import { useSessionId } from '@/hooks/useSessionId';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [optimisticQuery, setOptimisticQuery] = useState(null);
  const queryClient = useQueryClient();
  const { tier } = useSubscription();
  const todayCount = useDailyQueryCount();
  const sessionId = useSessionId();
  const isPro = tier === 'pro';
  const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount);

  // Ask mutation - uses backend service
  const askMutation = useMutation({
    mutationFn: async (promptText) => {
      // UcpRouterService.ask normalizes backend errors (message + code) on failure.
      const response = await UcpRouterService.ask(promptText, sessionId);
      if (!response.success) {
        const err = new Error(response.message || response.error || 'Failed to get response');
        err.code = response.error;
        throw err;
      }
      return response;
    },
    onSuccess: (data) => {
      setResult(data);
      setPrompt('');
      queryClient.invalidateQueries({ queryKey: ['recentQueries'] });
      queryClient.invalidateQueries({ queryKey: ['allQueryLogs'] });
    },
    onSettled: () => {
      setOptimisticQuery(null);
    }
  });

  const handleSubmit = () => {
    if (prompt.trim()) {
      // Warm the answer card chunk while the model is still working.
      loadAnswerCard();
      setOptimisticQuery({ id: 'optimistic', prompt, created_date: new Date().toISOString() });
      askMutation.mutate(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Deterministic Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask any question and watch the Universal Command Protocol (UCP) 
            route it to the optimal AI model using deterministic rules. 
            <span className="font-medium text-foreground"> Interpret once. Execute infinitely.</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <UcpStatusBadge showDetails />
          </div>
        </div>

        {/* Freemium quota indicator */}
        {!isPro && (
          <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 rounded-xl bg-muted/60 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-muted-foreground">
                Free tier • <span className="font-medium text-foreground">{remaining}</span>/{FREE_DAILY_LIMIT} queries left today
              </span>
            </div>
            <Link
              to="/Pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
            >
              <Crown className="w-4 h-4" /> Upgrade
            </Link>
          </div>
        )}
        {isPro && (
          <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 rounded-xl bg-brand/10 border border-brand/30">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-brand" />
              <span className="font-medium text-brand">Omega Access — unlimited routing</span>
            </div>
            <Link to="/Pricing" className="text-sm text-brand/80 hover:underline">
              Manage
            </Link>
          </div>
        )}

        {/* Main Input Card */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">
              Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              isLoading={askMutation.isPending}
              placeholder="What would you like to know? Try a short question for the fast model, or a longer one for the smart model..."
            />
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Suspense fallback={<PageLoadingSpinner />}>
              <AnswerCard result={result} />
            </Suspense>
          </div>
        )}

        {/* Error display */}
        {askMutation.isError && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-4">
              <p className="text-red-700 mb-2">
                {askMutation.error?.message || 'Unknown error'}
              </p>
              {askMutation.error?.code === 'free_limit_reached' && (
                <Link
                  to="/Pricing"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
                >
                  <Crown className="w-4 h-4" /> Upgrade to Omega Access
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Metrics + History with Pull-to-Refresh */}
        <PullToRefresh
          onRefresh={async () => {
            await queryClient.invalidateQueries({ queryKey: ['allQueryLogs'] });
            await queryClient.invalidateQueries({ queryKey: ['recentQueries'] });
          }}
        >
          <div className="mb-8">
            <MetricsCard />
          </div>

          {/* Query History Table */}
          <QueryHistoryTable limit={10} optimisticQuery={optimisticQuery} />
        </PullToRefresh>
      </div>
    </div>
  );
}