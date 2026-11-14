/**
 * Persistent speech recognition, modelled on POD's persistentAwsTranscription.ts.
 * The browser's SpeechRecognition stops itself after silences or network blips;
 * this wrapper restarts it with exponential backoff so the page stays "always listening".
 */
import { backoffDelay } from './sse';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  RECORDING = 'recording',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

export interface TranscriptionResult {
  text: string;
  isPartial: boolean;
  confidence: number;
  timestamp: number;
}

// Minimal typing for the (still vendor-prefixed) Web Speech API.
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);

class PersistentSpeechRecognition {
  private recognizer: SpeechRecognitionLike | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private wantListening = false;
  private attempts = 0;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private onResult: ((r: TranscriptionResult) => void) | null = null;
  private stateListeners = new Set<(s: ConnectionState, error?: string) => void>();
  lastError: string | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  getState(): ConnectionState {
    return this.state;
  }

  onStateChange(cb: (s: ConnectionState, error?: string) => void): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  start(onResult: (r: TranscriptionResult) => void): boolean {
    if (!this.isSupported()) {
      this.setState(ConnectionState.ERROR, 'Speech recognition is not supported in this browser. Use Chrome.');
      return false;
    }
    this.onResult = onResult;
    this.wantListening = true;
    this.attempts = 0;
    this.ensureRecognizer();
    this.setState(ConnectionState.CONNECTING);
    this.safeStart();
    return true;
  }

  stop(): void {
    this.wantListening = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    this.restartTimer = null;
    try { this.recognizer?.stop(); } catch { /* already stopped */ }
    this.setState(ConnectionState.DISCONNECTED);
  }

  private ensureRecognizer() {
    if (this.recognizer) return;
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r: SpeechRecognitionLike = new Ctor();
    r.lang = 'en-IN';
    r.continuous = true;
    r.interimResults = true;

    r.onstart = () => {
      this.attempts = 0;
      this.setState(ConnectionState.RECORDING);
    };
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = String(res[0]?.transcript ?? '').trim();
        if (!text) continue;
        this.onResult?.({
          text,
          isPartial: !res.isFinal,
          confidence: typeof res[0]?.confidence === 'number' && res[0].confidence > 0 ? res[0].confidence : 0.8,
          timestamp: Date.now(),
        });
      }
    };
    r.onerror = (e: any) => {
      if (FATAL_ERRORS.has(e.error)) {
        this.wantListening = false;
        this.setState(ConnectionState.ERROR, e.error === 'not-allowed'
          ? 'Microphone permission denied. Allow mic access and try again.'
          : `Microphone unavailable (${e.error}).`);
      }
      // no-speech / aborted / network: recoverable, onend restarts us.
    };
    r.onend = () => {
      if (!this.wantListening) return;
      this.setState(ConnectionState.RECONNECTING);
      const delay = this.attempts === 0 ? 0 : backoffDelay(this.attempts - 1, 250, 5000);
      this.attempts++;
      this.restartTimer = setTimeout(() => this.safeStart(), delay);
    };
    this.recognizer = r;
  }

  private safeStart() {
    try {
      this.recognizer?.start();
    } catch {
      // "already started" — harmless.
    }
  }

  private setState(s: ConnectionState, error?: string) {
    this.state = s;
    this.lastError = error ?? (s === ConnectionState.ERROR ? this.lastError : null);
    this.stateListeners.forEach((cb) => cb(s, error));
  }
}

export const persistentSpeechRecognition = new PersistentSpeechRecognition();
