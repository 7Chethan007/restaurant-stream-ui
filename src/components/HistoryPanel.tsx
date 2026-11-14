import { History, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type { HistoryItem } from '../types';
import { api } from '../utils/api';
import { formatClock } from '../utils/format';

/** Reads the session's stored turns back from DynamoDB via the backend. */
export function HistoryPanel({ sessionId }: { sessionId: string | null }) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try { setItems(await api.history(sessionId)); } catch (e) { setError((e as Error).message); }
    setLoading(false);
  };

  return (
    <details className="tw-card tw-history" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open && !items) load(); }}>
      <summary className="tw-card-head">
        <h3><History size={16} /> Stored history</h3>
        <span className="tw-muted">DynamoDB</span>
      </summary>
      <div className="tw-history-body">
        <button type="button" className="tw-btn tw-btn-ghost tw-btn-sm" onClick={load} disabled={loading || !sessionId}>
          <RefreshCw size={14} className={loading ? 'tw-spin' : ''} /> Refresh
        </button>
        {error && <p className="tw-error">{error}</p>}
        {items && items.length === 0 && <p className="tw-muted">Nothing stored yet for this session.</p>}
        {items && items.length > 0 && (
          <ol className="tw-history-list">
            {items.map((it) => (
              <li key={`${it.timestamp}-${it.event?.sequenceNumber}`}>
                <time className="tw-muted">{formatClock(it.timestamp)}</time>
                <span className="tw-history-line">“{it.transcript}”</span>
                <span className="tw-history-headline">{it.event?.headline}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
