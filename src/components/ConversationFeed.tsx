import { Ear } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SPEAKERS } from '../constants';
import type { ConversationState } from '../hooks/conversationReducer';
import { formatClock } from '../utils/format';
import { ReactionSummary } from './ReactionSummary';

interface Props {
  state: ConversationState;
  onOpenEvent: (seq: string) => void;
}

export function ConversationFeed({ state, onOpenEvent }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); },
    [state.lines.length, state.partial?.text, state.eventOrder.length]);

  const empty = state.lines.length === 0 && !state.partial;

  return (
    <section className="card feed" aria-label="Conversation">
      <header className="card-head">
        <h2>Conversation</h2>
        <span className="muted small">{state.lines.length} lines</span>
      </header>

      <div className="feed-scroll" aria-live="polite" aria-relevant="additions">
        {empty && (
          <div className="empty">
            <Ear size={28} />
            <p><b>Just talk.</b> Start listening and chat with your friend about where to eat —
              or press <i>Play demo conversation</i>.</p>
            <p className="muted small">Try: “food in Indiranagar”, “I want biryani”, “under 500 for two”,
              then “tell me about the second one”, “what’s on their menu?”</p>
          </div>
        )}

        {state.lines.map((l) => {
          const ev = l.eventSeq ? state.events[l.eventSeq] : undefined;
          return (
            <div key={l.id} className={`line ${l.speakerId}`}>
              <div className="bubble-row">
                <span className={`avatar ${l.speakerId}`} title={SPEAKERS[l.speakerId].label}>{SPEAKERS[l.speakerId].short}</span>
                <div className="bubble">
                  <p>{l.text}</p>
                  <time className="tiny muted">{formatClock(l.timestamp)}</time>
                </div>
              </div>
              {ev && <ReactionSummary e={ev} onOpen={onOpenEvent} />}
            </div>
          );
        })}

        {state.partial && (
          <div className={`line ${state.partial.speakerId} is-partial`}>
            <div className="bubble-row">
              <span className={`avatar ${state.partial.speakerId}`}>{SPEAKERS[state.partial.speakerId].short}</span>
              <div className="bubble"><p>{state.partial.text}…</p></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
