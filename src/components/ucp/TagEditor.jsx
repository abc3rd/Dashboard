import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Inline tag editor for a single query log. Tags are stored on the QueryLog
// record and are private to the record's owner (RLS: owner-or-admin update).
export default function TagEditor({ query }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const tags = Array.isArray(query.tags) ? query.tags : [];

  const commit = async (nextTags) => {
    setSaving(true);
    try {
      await base44.entities.QueryLog.update(query.id, { tags: nextTags });
      queryClient.invalidateQueries({ queryKey: ['recentQueries'] });
      queryClient.invalidateQueries({ queryKey: ['performanceLogs'] });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update tags.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = input.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setInput('');
      return;
    }
    commit([...tags, t]);
    setInput('');
  };

  const removeTag = (t) => commit(tags.filter((x) => x !== t));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-brand/10 text-brand text-xs font-medium px-2 py-1"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              disabled={saving}
              aria-label={`Remove tag ${t}`}
              className="hover:bg-brand/20 rounded-full p-0.5 min-h-[22px] min-w-[22px] flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No tags yet</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Add a tag (e.g. vocab, command)"
          disabled={saving}
          className="flex-1 min-h-[40px] rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={saving || !input.trim()}
          aria-label="Add tag"
          className="inline-flex items-center justify-center min-h-[40px] min-w-[44px] rounded-md border border-input bg-background hover:bg-accent px-3 text-sm font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}