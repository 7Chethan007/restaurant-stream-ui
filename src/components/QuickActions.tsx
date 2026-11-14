/** Bottom-right floating menu: typed input, demo conversation and reset live here, out of the main layout. */
import { Keyboard, Play, RotateCcw, Send, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  onSend: (text: string) => void;
  onDemo: () => void;
  demoRunning: boolean;
  onReset: () => void;
  disabled: boolean;
}

export function QuickActions({ onSend, onDemo, demoRunning, onReset, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={`fab-wrap ${open ? 'is-open' : ''}`}>
      {open && (
        <div className="fab-panel" role="dialog" aria-label="Quick actions">
          <span className="eyebrow">Ask once, by typing</span>
          <form
            className="manual"
            onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text); setText(''); } }}
          >
            <label htmlFor="manual-text" className="sr-only">Type a line as the current speaker</label>
            <input
              id="manual-text"
              ref={inputRef}
              value={text}
              maxLength={1000}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. biryani in Indiranagar"
              disabled={disabled}
            />
            <button type="submit" className="btn btn-primary" disabled={disabled || !text.trim()} aria-label="Ask">
              <Send size={16} />
            </button>
          </form>
          <div className="fab-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onDemo} disabled={disabled && !demoRunning}>
              {demoRunning ? <Square size={14} /> : <Play size={14} />}
              {demoRunning ? 'Stop demo' : 'Play demo conversation'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onReset} title="Clear context and start fresh">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        className="fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close quick actions' : 'Open quick actions: type a line or play the demo'}
      >
        {open ? <X size={22} /> : <Keyboard size={22} />}
        {demoRunning && !open && <span className="fab-dot" aria-hidden="true" />}
      </button>
    </div>
  );
}
