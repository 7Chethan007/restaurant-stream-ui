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
    <section className="tw-card" aria-label="Live suggestions">
      <header className="tw-card-head">
        <h3>Live suggestions</h3>
        {lastList && <span className="tw-muted">{lastList.recommendations?.length ?? 0} places</span>}
      </header>
      {!lastList ? (
        <div className="tw-empty is-small">
          <Sparkles size={24} />
          <p>Suggestions appear here the moment someone mentions a place, a dish or a budget.</p>
        </div>
      ) : (
        <>
          <p className="tw-headline">{lastList.headline}</p>
          <div className="tw-list">
            {(lastList.recommendations ?? []).map((r, i) => (
              <RestaurantCardView key={r.id} r={r} rank={i + 1} focused={r.id === focusedId} onChoose={onChoose} compact />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
