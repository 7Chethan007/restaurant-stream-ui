/** What the twin currently "knows" about the conversation, like POD's CategoryTracker. */
import { IndianRupee, MapPin, Soup, Store, UtensilsCrossed } from 'lucide-react';
import type { ConversationContext } from '../types';
import { formatRupees } from '../utils/format';

interface Props {
  context: ConversationContext;
  focusedName: string | null;
}

export function ContextTracker({ context, focusedName }: Props) {
  const steps = [
    { key: 'location', label: 'Location', icon: MapPin, value: context.location },
    { key: 'cuisine', label: 'Cuisine', icon: UtensilsCrossed, value: context.cuisines.join(', ') || null },
    { key: 'dish', label: 'Dish', icon: Soup, value: context.dishes.join(', ') || null },
    { key: 'budget', label: 'Budget', icon: IndianRupee,
      value: context.maxCostForTwo != null ? `up to ${formatRupees(context.maxCostForTwo)} for two` : null },
    { key: 'place', label: 'Chosen place', icon: Store,
      value: context.focusedRestaurantId ? (focusedName ?? 'Selected') : null },
  ];
  const filled = steps.filter((s) => s.value).length;

  return (
    <section className="tw-card" aria-label="Conversation context">
      <header className="tw-card-head">
        <h3>What we understood</h3>
        <span className="tw-muted">{filled}/{steps.length}</span>
      </header>
      <ol className="tw-tracker">
        {steps.map(({ key, label, icon: Icon, value }) => (
          <li key={key} className={value ? 'is-filled' : ''}>
            <span className="tw-tracker-icon"><Icon size={16} /></span>
            <span className="tw-tracker-label">{label}</span>
            <span className="tw-tracker-value" title={value ?? undefined}>{value ?? '—'}</span>
          </li>
        ))}
      </ol>
      <div className="tw-progress" aria-hidden="true"><span style={{ width: `${(filled / steps.length) * 100}%` }} /></div>
    </section>
  );
}
