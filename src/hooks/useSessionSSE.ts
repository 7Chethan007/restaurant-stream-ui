/**
 * Client hook for the per-session recommendation stream, modelled on POD's useKinesisSSE.
 * One EventSource per session; dedupe happens in the conversation reducer.
 */
import { useEffect, useRef, useState } from 'react';
import { API_BASE, SSE_EVENT_TYPES, SSE_MAX_RECONNECT_ATTEMPTS } from '../constants';
import type { RecommendationEvent } from '../types';
import { backoffDelay, isValidRecommendationEvent, parseSSEEventData } from '../utils/sse';

export interface SSEConnectionState {
  isConnected: boolean;
  lastEventTime: number | null;
  reconnectAttempts: number;
  error: string | null;
}

export function useSessionSSE(sessionId: string | null, onRecommendation: (e: RecommendationEvent) => void) {
  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false, lastEventTime: null, reconnectAttempts: 0, error: null,
  });
  const callbackRef = useRef(onRecommendation);
  callbackRef.current = onRecommendation;

  useEffect(() => {
    if (!sessionId) return;
    let es: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let closed = false;

    const connect = () => {
      es = new EventSource(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/stream`);
      const touch = () => setState((s) => ({ ...s, lastEventTime: Date.now() }));

      es.addEventListener(SSE_EVENT_TYPES.CONNECTION, () => {
        attempts = 0;
        setState({ isConnected: true, lastEventTime: Date.now(), reconnectAttempts: 0, error: null });
      });
      es.addEventListener(SSE_EVENT_TYPES.PING, touch);
      es.addEventListener(SSE_EVENT_TYPES.RECOMMENDATION, (ev) => {
        const data = parseSSEEventData((ev as MessageEvent).data);
        if (!isValidRecommendationEvent(data) || data.sessionId !== sessionId) return;
        touch();
        callbackRef.current(data);
      });
      es.addEventListener(SSE_EVENT_TYPES.ERROR, (ev) => {
        const data = parseSSEEventData<{ message?: string }>((ev as MessageEvent).data ?? '');
        if (data?.message) setState((s) => ({ ...s, error: data.message! }));
      });
      es.onerror = () => {
        es?.close();
        if (closed) return;
        setState((s) => ({ ...s, isConnected: false, error: 'Live stream disconnected', reconnectAttempts: attempts + 1 }));
        if (attempts >= SSE_MAX_RECONNECT_ATTEMPTS) return;
        timer = setTimeout(connect, backoffDelay(attempts++, 1000, 10_000));
      };
    };

    connect();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      es?.close();
      setState((s) => ({ ...s, isConnected: false }));
    };
  }, [sessionId]);

  return state;
}
