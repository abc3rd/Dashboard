import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, History } from 'lucide-react';
import { format } from 'date-fns';
import ModelBadge from './ModelBadge';
import ConfidenceMeter from './ConfidenceMeter';
import { cn } from '@/lib/utils';

function ExpandableRow({ query }) {
  const [expanded, setExpanded] = useState(false);

  const truncatedPrompt = query.prompt?.length > 80 
    ? query.prompt.slice(0, 80) + '...' 
    : query.prompt;

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(query.created_date), 'MMM d, HH:mm')}
          </div>
        </TableCell>
        <TableCell className="max-w-xs">
          <p className="text-sm text-slate-700 truncate">{truncatedPrompt}</p>
        </TableCell>
        <TableCell>
          <ModelBadge modelId={query.chosen_model} size="small" />
        </TableCell>
        <TableCell>
          <div className="w-24">
            <ConfidenceMeter value={query.confidence || 0} showLabel={false} />
          </div>
        </TableCell>
        <TableCell className="text-sm text-slate-600">
          {query.latency_ms}ms
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-slate-50 p-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Full Prompt
                </h4>
                <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border">
                  {query.prompt}
                </p>
              </div>
              {query.answer && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Response
                  </h4>
                  <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border whitespace-pre-wrap">
                    {query.answer}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function QueryHistoryTable({ limit = 10 }) {
  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['recentQueries', limit],
    queryFn: () => base44.entities.QueryLog.list('-created_date', limit),
  });

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center text-slate-400">
          Loading query history...
        </CardContent>
      </Card>
    );
  }

  if (queries.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center text-slate-400">
          No queries yet. Ask a question to see history.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" />
          <CardTitle className="text-base font-semibold text-slate-700">
            Recent Queries
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-32">Time</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead className="w-32">Model</TableHead>
                <TableHead className="w-32">Confidence</TableHead>
                <TableHead className="w-24">Latency</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((query) => (
                <ExpandableRow key={query.id} query={query} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}