import { Mic, MicOff, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConnectionState } from '../utils/persistentSpeechRecognition';
import { formatDurationHMS } from '../utils/format';
import { AudioVisualizer } from './AudioVisualizer';

const STATE_LABEL: Record<ConnectionState, string> = {
  [ConnectionState.DISCONNECTED]: 'Not listening',
  [ConnectionState.CONNECTING]: 'Connecting mic…',
  [ConnectionState.RECORDING]: 'Listening',
  [ConnectionState.RECONNECTING]: 'Listening',
  [ConnectionState.ERROR]: 'Mic error',
};

interface Props {
  micState: ConnectionState;
  micError: string | null;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}

export function RecordingBar(p: Props) {
  const live = p.micState === ConnectionState.RECORDING || p.micState === ConnectionState.RECONNECTING
    || p.micState === ConnectionState.CONNECTING;
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!live) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  return (
    <section className="tw-listen" aria-label="Listening controls">
      <div className="tw-listen-row">
        <button
          type="button"
          className={`tw-btn tw-btn-full ${live ? 'is-live' : ''}`}
          onClick={live ? p.onStop : p.onStart}
          disabled={p.disabled && !live}
          aria-pressed={live}
        >
          {live ? <Square size={16} /> : <Mic size={16} />}
          {live ? 'Stop listening' : 'Start listening'}
        </button>

        <div className={`tw-meter ${live ? 'is-live' : ''} ${p.micState === ConnectionState.ERROR ? 'is-error' : ''}`}>
          <span className="tw-timer">{formatDurationHMS(live ? seconds : 0)}</span>
          <AudioVisualizer isActive={live} />
          <span className="tw-meter-status" role="status">
            {p.micState === ConnectionState.ERROR ? <MicOff size={14} /> : <span className={`tw-dot ${live ? 'is-live' : ''}`} />}
            {STATE_LABEL[p.micState]}
          </span>
        </div>
      </div>
      {p.micError && <p className="tw-error" role="alert">{p.micError}</p>}
    </section>
  );
}
