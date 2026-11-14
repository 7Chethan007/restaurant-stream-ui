/** What the twin currently "knows" about the conversation, like POD's CategoryTracker. */
import { IndianRupee, MapPin, Soup, Store, UtensilsCrossed } from 'lucide-react';
import type { ConversationContext, RecommendationEvent } from '../types';
import { formatRupees } from '../utils/format';

interface Props {
  context: ConversationContext;
  focusedName: string | null;
  latest: RecommendationEvent | null;
}

export function ContextTracker({ context, focusedName }: Props) {
  const steps = [
    { key: 'location', label: 'Location', icon: MapPin, value: context.location },
    { key: 'cuisine', label: 'Cuisine', icon: UtensilsCrossed, value: context.cuisines.join(', ') || null },
    { key: 'dish', label: 'Dish', icon: Soup, value: context.dishes.join(', ') || null },
    { key: 'budget', label: 'Budget', icon: IndianRupee,
      value: context.maxCostForTwo != null ? `≤ ${formatRupees(context.maxCostForTwo)} for two` : null },
    { key: 'place', label: 'Chosen place', icon: Store,
      value: context.focusedRestaurantId ? (focusedName ?? 'Selected') : null },
  ];
  const filled = steps.filter((s) => s.value).length;

  return (
    <section className="card context-tracker" aria-label="Conversation context">
      <header className="card-head">
        <h2>What we heard</h2>
        <span className="muted small">{filled}/{steps.length} signals</span>
      </header>
      <ol className="tracker">
        {steps.map(({ key, label, icon: Icon, value }) => (
          <li key={key} className={`tracker-step ${value ? 'is-filled' : ''}`}>
            <span className="tracker-icon"><Icon size={16} /></span>
            <span className="tracker-label">{label}</span>
            <span className="tracker-value" title={value ?? undefined}>{value ?? '—'}</span>
          </li>
        ))}
      </ol>
      <div className="tracker-progress" aria-hidden="true">
        <span style={{ width: `${(filled / steps.length) * 100}%` }} />
      </div>
    </section>
  );
}
