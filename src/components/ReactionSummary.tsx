import { MessageSquareText, SearchX, Sparkles } from 'lucide-react';
import type { RecommendationEvent } from '../types';

/** One-line system reaction shown under the line that caused it. */
export function ReactionSummary({ e, onOpen }: { e: RecommendationEvent; onOpen: (seq: string) => void }) {
  const Icon = e.eventType === 'NO_MATCH' ? SearchX : e.eventType === 'RESTAURANT_ANSWER' ? MessageSquareText : Sparkles;
  const sub = e.eventType === 'RECOMMENDATIONS'
    ? `${e.recommendations?.length ?? 0} places · top: ${e.recommendations?.[0]?.name ?? '—'}`
    : e.eventType === 'RESTAURANT_ANSWER'
      ? e.answer?.text ?? e.restaurant?.name
      : 'Nothing matched — try a nearby area or another dish.';
  return (
    <button type="button" className={`tw-reaction is-${e.eventType.toLowerCase()}`} onClick={() => onOpen(e.sequenceNumber)}>
      <Icon size={16} />
      <span>
        <b>{e.headline}</b>
        <span className="tw-reaction-sub">{sub}</span>
      </span>
    </button>
  );
}
