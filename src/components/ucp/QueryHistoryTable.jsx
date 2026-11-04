import { useMemo, useState } from 'react';
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
import {
  ChevronDown, ChevronUp, Clock, Download, History, Loader2,
  Trash2, X, Search, ArrowDownUp, Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ModelBadge from './ModelBadge';
import ConfidenceMeter from './ConfidenceMeter';
import QueryHistoryCard from './QueryHistoryCard';
import PendingQueryCard from './PendingQueryCard';
import TagEditor from './TagEditor';

// Fetch window for the history/search view. The list call is RLS-scoped, so
// only the current user's own logs ever load (admins see their own oversight
// view). No shared or team-wide view is exposed here.
const FETCH_LIMIT = 200;

function TagChips({ tags }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center rounded-full bg-brand/10 text-brand text-[10px] font-medium px-1.5 py-0.5">
          {t}
        </span>
      ))}
    </div>
  );
}

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
          <TagChips tags={query.tags} />
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
                  Tags
                </h4>
                <TagEditor query={query} />
              </div>
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
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const sortField = sortOrder === 'oldest' ? 'created_date' : '-created_date';

  const { data: queries = [], isLoading } = useQuery({
    queryKey: ['recentQueries', limit, sortOrder],
    queryFn: () => base44.entities.QueryLog.list(sortField, FETCH_LIMIT),
  });

  // Distinct tags across the user's loaded logs, for the tag filter.
  const allTags = useMemo(() => {
    const set = new Set();
    queries.forEach((q) => (q.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [queries]);

  const isFiltering = searchQuery.trim() !== '' || activeTag !== null;

  const displayed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = queries;
    if (q) {
      list = list.filter((item) => {
        const haystack = [
          item.prompt || '',
          item.answer || '',
          (item.tags || []).join(' '),
        ].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    if (activeTag) {
      list = list.filter((item) => (item.tags || []).includes(activeTag));
    }
    // When not filtering, keep the caller's display limit; when searching or
    // filtering by tag, show every match across the fetched window.
    return isFiltering ? list : list.slice(0, limit);
  }, [queries, searchQuery, activeTag, limit, isFiltering]);

  const queryIds = displayed.map((q) => q.id);
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

  // Per-account export: RLS scopes the list to the current user's own logs, so
  // this CSV only ever contains this account's records. No shared/team bucket.
  const handleExport = async () => {
    try {
      const { items = [] } = await base44.entities.QueryLog.list('-created_date', 500);
      const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['Created', 'Model', 'Confidence', 'Latency (ms)', 'Tags', 'Prompt', 'Answer']
          .map(escape).join(','),
        ...items.map((q) => escape(format(new Date(q.created_date), "yyyy-MM-dd HH:mm:ss"))
          + ',' + escape(q.chosen_model)
          + ',' + escape(q.confidence)
          + ',' + escape(q.latency_ms)
          + ',' + escape((q.tags || []).join(' '))
          + ',' + escape(q.prompt)
          + ',' + escape(q.answer))
      ];
      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ucp-queries-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${items.length} ${items.length === 1 ? 'log' : 'logs'} (this account only).`);
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Export failed.');
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              className="min-h-11"
              aria-label={`Sort by date, currently ${sortOrder === 'newest' ? 'newest first' : 'oldest first'}`}
            >
              <ArrowDownUp className="w-4 h-4 mr-2" />
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="min-h-11"
              aria-label="Export your query logs as a CSV file (this account only)"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search + tag filter */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, responses, or tags…"
              aria-label="Search query history"
              className="w-full min-h-[40px] rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 mr-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[28px] ' +
                  (activeTag === null
                    ? 'bg-brand text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70')
                }
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors min-h-[28px] ' +
                    (activeTag === t
                      ? 'bg-brand text-white'
                      : 'bg-brand/10 text-brand hover:bg-brand/20')
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-500">{selectedCount} selected</span>
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
      </CardHeader>

      <CardContent className="p-0">
        {displayed.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No queries match your search.
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden">
              {optimisticQuery && !isFiltering && <PendingQueryCard prompt={optimisticQuery.prompt} />}
              {displayed.map((query) => (
                <QueryHistoryCard
                  key={query.id}
                  query={query}
                  selected={selected.has(query.id)}
                  onToggleSelect={toggleOne}
                />
              ))}
            </div>

            {/* Tablet and up: table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-10 pr-0">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all visible queries"
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
                  {optimisticQuery && !isFiltering && (
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
                  {displayed.map((query) => (
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
          </>
        )}
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