import { Send } from 'lucide-react';
import { useState } from 'react';

export function ManualInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('');
  return (
    <form
      className="manual"
      onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text); setText(''); } }}
    >
      <label htmlFor="manual-text" className="sr-only">Type a line of conversation</label>
      <input
        id="manual-text"
        value={text}
        maxLength={1000}
        onChange={(e) => setText(e.target.value)}
        placeholder="No mic? Type a line as the current speaker…"
        disabled={disabled}
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !text.trim()} aria-label="Send line">
        <Send size={16} />
      </button>
    </form>
  );
}
