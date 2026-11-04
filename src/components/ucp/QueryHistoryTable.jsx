import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronUp, Clock, History, Loader2, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ModelBadge from './ModelBadge';
import ConfidenceMeter from './ConfidenceMeter';
import QueryHistoryCard from './QueryHistoryCard';
import PendingQueryCard from './PendingQueryCard';

function ExpandableRow({ query, selected, onToggleSelect }) {
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
        <TableCell className="w-10 pr-0" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(query.id)}
            aria-label={`Select query from ${format(new Date(query.created_date), 'MMM d, HH:mm')}`}
          />
        </TableCell>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide query details' : 'Show query details'}
          >
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
          <TableCell colSpan={7} className="bg-slate-50 p-4">
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

export default function QueryHistoryTable({ limit = 10, optimisticQuery = null }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['recentQueries', limit],
    queryFn: () => base44.entities.QueryLog.list('-created_date', limit),
  });

  const queryIds = queries.map((q) => q.id);
  const allSelected = queryIds.length > 0 && queryIds.every((id) => selected.has(id));
  const selectedCount = selected.size;

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        queryIds.forEach((id) => next.delete(id));
      } else {
        queryIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const handleDelete = async () => {
    const ids = Array.from(selected);
    setConfirmOpen(false);
    setDeleting(true);
    try {
      await base44.entities.QueryLog.deleteMany({ id: { $in: ids } });
      toast.success(`Deleted ${ids.length} ${ids.length === 1 ? 'log' : 'logs'}.`);
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ['recentQueries'] });
      queryClient.invalidateQueries({ queryKey: ['performanceLogs'] });
    } catch (e) {
      const status = e?.response?.status;
      const msg = status === 403
        ? 'Only admins can delete query logs.'
        : (e?.response?.data?.error || e?.message || 'Failed to delete logs.');
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <CardTitle className="text-base font-semibold text-slate-700">
              Recent Queries
            </CardTitle>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {selectedCount} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
                className="min-h-11"
              >
                {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                disabled={deleting}
                className="min-h-11"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile: stacked cards, one per query */}
        <div className="md:hidden">
          {optimisticQuery && <PendingQueryCard prompt={optimisticQuery.prompt} />}
          {queries.map((query) => (
            <QueryHistoryCard
              key={query.id}
              query={query}
              selected={selected.has(query.id)}
              onToggleSelect={toggleOne}
            />
          ))}
        </div>

        {/* Tablet and up: unchanged table layout */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-10 pr-0">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all queries"
                  />
                </TableHead>
                <TableHead className="w-32">Time</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead className="w-32">Model</TableHead>
                <TableHead className="w-32">Confidence</TableHead>
                <TableHead className="w-24">Latency</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimisticQuery && (
                <TableRow className="bg-brand/5">
                  <TableCell />
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                      Now
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-foreground truncate">{optimisticQuery.prompt}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground italic">routing…</span>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 h-2 rounded-full bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
              {queries.map((query) => (
                <ExpandableRow
                  key={query.id}
                  query={query}
                  selected={selected.has(query.id)}
                  onToggleSelect={toggleOne}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} {selectedCount === 1 ? 'log' : 'logs'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the selected query {selectedCount === 1 ? 'log' : 'logs'} from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="min-h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}