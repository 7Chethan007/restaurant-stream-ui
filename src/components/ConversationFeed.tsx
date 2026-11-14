import { Ear, Mic } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ConversationState } from '../hooks/conversationReducer';
import { formatClock } from '../utils/format';
import { ReactionSummary } from './ReactionSummary';

interface Props {
  state: ConversationState;
  onOpenEvent: (seq: string) => void;
}

export function ConversationFeed({ state, onOpenEvent }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Scroll only the feed, never the page.
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); },
    [state.lines.length, state.partial, state.eventOrder.length]);

  const empty = state.lines.length === 0 && !state.partial;

  return (
    <section className="tw-card tw-feed" aria-label="Conversation">
      <header className="tw-card-head">
        <h3>What I heard</h3>
        <span className="tw-muted">{state.lines.length} {state.lines.length === 1 ? 'line' : 'lines'}</span>
      </header>

      <div ref={scrollRef} className="tw-feed-scroll" aria-live="polite" aria-relevant="additions">
        {empty && (
          <div className="tw-empty">
            <Ear size={30} />
            <p><b>Just talk.</b> Press <i>Start listening</i> and chat about where to eat. Suggestions pop up on their own.</p>
            <p className="tw-muted">Try: “food in Indiranagar”, “I want biryani”, “under 500 for two”, then “tell me about the second one”, “what’s on their menu?”</p>
          </div>
        )}

        {state.lines.map((l) => {
          const ev = l.eventSeq ? state.events[l.eventSeq] : undefined;
          return (
            <div key={l.id} className="tw-line">
              <div className="tw-bubble-row">
                <span className="tw-ear" aria-hidden="true"><Mic size={14} /></span>
                <div className="tw-bubble">
                  <p>{l.text}</p>
                  <time>{formatClock(l.timestamp)}</time>
                </div>
              </div>
              {ev && <ReactionSummary e={ev} onOpen={onOpenEvent} />}
            </div>
          );
        })}

        {state.partial && (
          <div className="tw-line is-partial">
            <div className="tw-bubble-row">
              <span className="tw-ear" aria-hidden="true"><Mic size={14} /></span>
              <div className="tw-bubble"><p>{state.partial}…</p></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
