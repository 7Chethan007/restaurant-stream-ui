/** Right-hand panel: the latest recommendation list stays visible after the popup goes. */
import { Sparkles } from 'lucide-react';
import type { RecommendationEvent } from '../types';
import { RestaurantCardView } from './RestaurantCardView';

interface Props {
  lastList: RecommendationEvent | null;
  focusedId: string | null;
  onChoose: (id: string) => void;
}

export function LivePanel({ lastList, focusedId, onChoose }: Props) {
  return (
    <section className="card live-panel" aria-label="Live suggestions">
      <header className="card-head">
        <h2>Live suggestions</h2>
        {lastList && <span className="muted small">{lastList.recommendations?.length ?? 0} places</span>}
      </header>
      {!lastList ? (
        <div className="empty small-empty">
          <Sparkles size={22} />
          <p>Suggestions appear here the moment someone mentions a place, a dish or a budget.</p>
        </div>
      ) : (
        <>
          <p className="live-headline">{lastList.headline}</p>
          <div className="live-list">
            {(lastList.recommendations ?? []).map((r, i) => (
              <RestaurantCardView key={r.id} r={r} rank={i + 1} focused={r.id === focusedId} onChoose={onChoose} compact />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
