/** Floating, draggable card that pops on every new event — the digital twin "nudge". */
import { GripHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { POPUP_AUTO_DISMISS_MS } from '../constants';
import { usePopupManager } from '../hooks/usePopupManager';
import type { RecommendationEvent } from '../types';
import { RestaurantCardView } from './RestaurantCardView';

interface Props {
  event: RecommendationEvent | null;
  focusedId: string | null;
  onChoose: (id: string) => void;
  onOpenDetail: (seq: string) => void;
  onClose: () => void;
}

export function RecommendationPopup({ event, focusedId, onChoose, onOpenDetail, onClose }: Props) {
  const { position, handlePointerDown, isDragging } = usePopupManager();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!event || hovered || isDragging) return;
    const t = setTimeout(onClose, POPUP_AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [event, hovered, isDragging, onClose]);

  if (!event) return null;
  const style = position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined;

  return (
    <div
      key={event.sequenceNumber}
      className={`tw-popup draggable-popup is-${event.eventType.toLowerCase()}`}
      style={style}
      role="dialog"
      aria-label={event.headline}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <header className="tw-popup-head" onPointerDown={handlePointerDown}>
        <GripHorizontal size={16} className="tw-grip" />
        <div>
          <span className="tw-eyebrow">{event.transcript_text ? `Heard “${event.transcript_text}”` : 'You chose a place'}</span>
          <h3>{event.headline}</h3>
        </div>
        <button type="button" className="tw-icon-btn" onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
      </header>

      <div className="tw-popup-body">
        {event.eventType === 'RECOMMENDATIONS' && (event.recommendations ?? []).map((r, i) => (
          <RestaurantCardView key={r.id} r={r} rank={i + 1} focused={r.id === focusedId} onChoose={onChoose} compact={i > 1} />
        ))}

        {event.eventType === 'RESTAURANT_ANSWER' && event.restaurant && (
          <div className="tw-answer">
            <p className="tw-answer-text">{event.answer?.text}</p>
            {event.answer && event.answer.facts.length > 0 && (
              <dl className="tw-facts">
                {event.answer.facts.slice(0, 4).map((f) => (
                  <div key={f.label} className="tw-fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
            )}
            <button type="button" className="tw-btn tw-btn-full tw-btn-sm" onClick={() => onOpenDetail(event.sequenceNumber)}>
              Open {event.restaurant.name}
            </button>
          </div>
        )}

        {event.eventType === 'NO_MATCH' && (
          <p className="tw-muted">No restaurant in the data fits all of that. Try a nearby area, another dish, or a bigger budget.</p>
        )}
      </div>
      {!hovered && <div className="tw-popup-timer" style={{ animationDuration: `${POPUP_AUTO_DISMISS_MS}ms` }} />}
    </div>
  );
}
