import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PromptInput from '@/components/ucp/PromptInput';
import AnswerCard from '@/components/ucp/AnswerCard';
import UcpStatusBadge from '@/components/ucp/UcpStatusBadge';
import MetricsCard from '@/components/ucp/MetricsCard';
import QueryHistoryTable from '@/components/ucp/QueryHistoryTable';
import { UcpRouterService } from '@/components/ucp/UcpService';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  // Ask mutation - uses backend service
  const askMutation = useMutation({
    mutationFn: async (promptText) => {
      // Call the UCP Router backend service
      const response = await UcpRouterService.ask(promptText);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get response');
      }
      
      return response;
    },
    onSuccess: (data) => {
      setResult(data);
      setPrompt('');
      queryClient.invalidateQueries({ queryKey: ['recentQueries'] });
      queryClient.invalidateQueries({ queryKey: ['allQueryLogs'] });
    }
  });

  const handleSubmit = () => {
    if (prompt.trim()) {
      askMutation.mutate(prompt);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            UCP AI Router
          </h1>
          <div className="flex items-center justify-center gap-2 text-violet-600 mb-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Patent Pending</span>
          </div>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Ask any question and watch the Universal Command Protocol (UCP) — Patent Pending — 
            route it to the optimal AI model using deterministic rules. 
            <span className="font-medium text-slate-700"> Interpret once. Execute infinitely.</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <UcpStatusBadge showDetails />
          </div>
        </div>

        {/* Main Input Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">
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
            <AnswerCard result={result} />
          </div>
        )}

        {/* Error display */}
        {askMutation.isError && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-4">
              <p className="text-red-700">
                An error occurred: {askMutation.error?.message || 'Unknown error'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metrics Card */}
        <div className="mb-8">
          <MetricsCard />
        </div>

        {/* Query History Table */}
        <QueryHistoryTable limit={10} />
      </div>
    </div>
  );
}