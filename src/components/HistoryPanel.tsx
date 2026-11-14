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
    <details className="card history" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open && !items) load(); }}>
      <summary className="card-head">
        <h2><History size={16} /> Stored history</h2>
        <span className="muted small">DynamoDB</span>
      </summary>
      <div className="history-body">
        <button type="button" className="btn btn-ghost btn-sm" onClick={load} disabled={loading || !sessionId}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
        {error && <p className="inline-error">{error}</p>}
        {items && items.length === 0 && <p className="muted small">Nothing stored yet for this session.</p>}
        {items && items.length > 0 && (
          <ol className="history-list">
            {items.map((it) => (
              <li key={`${it.timestamp}-${it.event?.sequenceNumber}`}>
                <time className="tiny muted">{formatClock(it.timestamp)}</time>
                <span className="history-transcript">“{it.transcript}”</span>
                <span className="history-headline">{it.event?.headline}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
