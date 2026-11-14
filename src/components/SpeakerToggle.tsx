import { useEffect } from 'react';
import { SPEAKERS } from '../constants';
import type { SpeakerId } from '../types';

interface Props {
  speaker: SpeakerId;
  onSet: (s: SpeakerId) => void;
  onToggle: () => void;
}

/** Web Speech has no speaker diarization, so the talker is chosen here; Tab swaps. */
export function SpeakerToggle({ speaker, onSet, onToggle }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === 'Tab' && !typing && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onToggle]);

  return (
    <div className="speaker-toggle" role="radiogroup" aria-label="Who is speaking">
      <span className="eyebrow">Now talking</span>
      {(Object.keys(SPEAKERS) as SpeakerId[]).map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={speaker === id}
          className={`chip speaker-chip ${id} ${speaker === id ? 'is-active' : ''}`}
          onClick={() => onSet(id)}
        >
          <span className={`avatar ${id}`}>{SPEAKERS[id].short}</span>
          {SPEAKERS[id].label}
        </button>
      ))}
      <kbd title="Press Tab to swap speakers">Tab</kbd>
    </div>
  );
}
