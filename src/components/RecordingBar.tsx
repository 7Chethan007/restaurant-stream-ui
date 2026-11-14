import { Mic, MicOff, Play, RotateCcw, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConnectionState } from '../utils/persistentSpeechRecognition';
import { formatDurationHMS } from '../utils/format';
import { AudioVisualizer } from './AudioVisualizer';
import { SpeakerToggle } from './SpeakerToggle';
import type { SpeakerId } from '../types';

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
  speaker: SpeakerId;
  onToggleSpeaker: () => void;
  onSetSpeaker: (s: SpeakerId) => void;
  onStart: () => void;
  onStop: () => void;
  onDemo: () => void;
  demoRunning: boolean;
  onReset: () => void;
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
    <section className="card recording-bar" aria-label="Listening controls">
      <div className="recording-row">
        <button
          type="button"
          className={`btn btn-primary btn-listen ${live ? 'is-live' : ''}`}
          onClick={live ? p.onStop : p.onStart}
          disabled={p.disabled && !live}
          aria-pressed={live}
        >
          {live ? <Square size={16} /> : <Mic size={16} />}
          {live ? 'Stop listening' : 'Start listening'}
        </button>

        <div className={`visualizer-pill ${live ? 'is-live' : ''} ${p.micState === ConnectionState.ERROR ? 'is-error' : ''}`}>
          <span className="timer">{formatDurationHMS(live ? seconds : 0)}</span>
          <AudioVisualizer isActive={live} />
          <span className="pill-status" role="status">
            {p.micState === ConnectionState.ERROR ? <MicOff size={14} /> : <span className={`dot ${live ? 'dot-live' : ''}`} />}
            {STATE_LABEL[p.micState]}
          </span>
        </div>
      </div>

      <div className="recording-row secondary">
        <SpeakerToggle speaker={p.speaker} onSet={p.onSetSpeaker} onToggle={p.onToggleSpeaker} />
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={p.onDemo} disabled={p.disabled && !p.demoRunning}>
            {p.demoRunning ? <Square size={14} /> : <Play size={14} />}
            {p.demoRunning ? 'Stop demo' : 'Play demo conversation'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={p.onReset} title="Clear context and start fresh">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {p.micError && <p className="inline-error" role="alert">{p.micError}</p>}
    </section>
  );
}
