import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DEMO_GAP_MS, DEMO_SCRIPT } from '../constants';
import type { RecommendationEvent } from '../types';
import { api } from '../utils/api';
import { createFinalizer } from '../utils/interimFinalizer';
import { ConnectionState, persistentSpeechRecognition } from '../utils/persistentSpeechRecognition';
import { conversationReducer, initialConversation } from './conversationReducer';
import { useSessionSSE } from './useSessionSSE';

const newId = () => Math.random().toString(36).slice(2, 10);

export function useConversation() {
  const [state, dispatch] = useReducer(conversationReducer, initialConversation);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [micState, setMicState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [micError, setMicError] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const demoCancel = useRef(false);
  const finalizerRef = useRef<ReturnType<typeof createFinalizer> | null>(null);
  const confidenceRef = useRef(1);

  const createSession = useCallback(async () => {
    try {
      setSessionError(null);
      setSessionId(await api.createSession());
    } catch (e) {
      setSessionError((e as Error).message);
    }
  }, []);

  useEffect(() => { createSession(); }, [createSession]);

  const onEvent = useCallback((e: RecommendationEvent) => dispatch({ type: 'event', event: e }), []);
  const sse = useSessionSSE(sessionId, onEvent);

  const sendFinal = useCallback(async (text: string, confidence = 1) => {
    const clean = text.trim();
    if (!clean || !sessionId) return;
    dispatch({ type: 'final', id: newId(), text: clean, timestamp: Date.now() });
    try {
      setSendError(null);
      await api.sendTranscript(sessionId, clean, confidence, false);
    } catch (e) {
      setSendError(`Could not send to backend: ${(e as Error).message}`);
    }
  }, [sessionId]);

  useEffect(() => persistentSpeechRecognition.onStateChange((s, err) => {
    setMicState(s);
    if (err) setMicError(err);
  }), []);

  const startListening = useCallback(() => {
    setMicError(null);
    const finalizer = createFinalizer((text) => sendFinal(text, confidenceRef.current));
    finalizerRef.current = finalizer;
    persistentSpeechRecognition.start((r) => {
      confidenceRef.current = r.confidence;
      if (r.isPartial) { dispatch({ type: 'partial', text: r.text }); finalizer.partial(r.text); }
      else finalizer.final(r.text);
    });
  }, [sendFinal]);

  const stopListening = useCallback(() => { finalizerRef.current?.cancel(); persistentSpeechRecognition.stop(); }, []);
  useEffect(() => () => { finalizerRef.current?.cancel(); persistentSpeechRecognition.stop(); }, []);

  const focusRestaurant = useCallback(async (restaurantId: string) => {
    if (!sessionId) return;
    try { await api.focus(sessionId, restaurantId); } catch (e) { setSendError((e as Error).message); }
  }, [sessionId]);

  const resetConversation = useCallback(async () => {
    demoCancel.current = true;
    dispatch({ type: 'reset' });
    if (sessionId) {
      try { await api.reset(sessionId); } catch { /* backend offline: local reset is still useful */ }
    }
  }, [sessionId]);

  const runDemo = useCallback(async () => {
    if (demoRunning) { demoCancel.current = true; return; }
    demoCancel.current = false;
    setDemoRunning(true);
    for (const step of DEMO_SCRIPT) {
      if (demoCancel.current) break;
      await sendFinal(step);
      await new Promise((r) => setTimeout(r, DEMO_GAP_MS));
    }
    setDemoRunning(false);
  }, [demoRunning, sendFinal]);

  return {
    state, dispatch, sessionId, sessionError, createSession, sse,
    micState, micError, startListening, stopListening,
    sendFinal, focusRestaurant, resetConversation, runDemo, demoRunning, sendError,
  };
}
