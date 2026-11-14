import { Radio, Server, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContextTracker } from './components/ContextTracker';
import { ConversationFeed } from './components/ConversationFeed';
import { HistoryPanel } from './components/HistoryPanel';
import { LivePanel } from './components/LivePanel';
import { ManualInput } from './components/ManualInput';
import { RecommendationPopup } from './components/RecommendationPopup';
import { RecordingBar } from './components/RecordingBar';
import { RestaurantDetail } from './components/RestaurantDetail';
import { useBackendHealth } from './hooks/useBackendHealth';
import { useConversation } from './hooks/useConversation';
import type { RecommendationEvent, RestaurantCard } from './types';

export default function App() {
  const c = useConversation();
  const online = useBackendHealth();
  const { state } = c;

  const [popup, setPopup] = useState<RecommendationEvent | null>(null);
  const [drawerSeq, setDrawerSeq] = useState<string | null>(null);

  // Pop every new event, like POD's suggested-question popups.
  useEffect(() => { if (state.latest) setPopup(state.latest); }, [state.latest]);

  // A fresh answer about the chosen place also refreshes an open drawer.
  useEffect(() => {
    if (drawerSeq && state.latest?.eventType === 'RESTAURANT_ANSWER') setDrawerSeq(state.latest.sequenceNumber);
  }, [state.latest]);

  const lastList = useMemo(() => {
    for (let i = state.eventOrder.length - 1; i >= 0; i--) {
      const e = state.events[state.eventOrder[i]];
      if (e.eventType === 'RECOMMENDATIONS') return e;
    }
    return null;
  }, [state.events, state.eventOrder]);

  const focusedId = state.context.focusedRestaurantId;
  const focused: RestaurantCard | null = useMemo(() => {
    if (!focusedId) return null;
    for (let i = state.eventOrder.length - 1; i >= 0; i--) {
      const e = state.events[state.eventOrder[i]];
      if (e.restaurant?.id === focusedId) return e.restaurant;
      const hit = e.recommendations?.find((r) => r.id === focusedId);
      if (hit) return hit;
    }
    return null;
  }, [focusedId, state.events, state.eventOrder]);

  const openEvent = useCallback((seq: string) => {
    const e = state.events[seq];
    if (!e) return;
    if (e.eventType === 'RESTAURANT_ANSWER' && e.restaurant) setDrawerSeq(seq);
    else setPopup(e);
  }, [state.events]);

  const closePopup = useCallback(() => setPopup(null), []);
  const drawerEvent = drawerSeq ? state.events[drawerSeq] : null;
  const ready = online !== false && !!c.sessionId;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="logo" aria-hidden="true">🍽</span>
            <span>Omnifood <b>Twin</b></span>
          </div>
          <h1>Talk about food.<br /><span>We'll find the table.</span></h1>
          <p className="hero-sub">An always-listening digital twin for Bangalore's 12,000+ restaurants —
            streamed through Kinesis and Apache Flink as you speak.</p>
          <div className="status-row">
            <span className={`status-badge ${online ? 'ok' : online === false ? 'bad' : ''}`}>
              {online === false ? <WifiOff size={14} /> : <Server size={14} />}
              {online == null ? 'Checking backend…' : online ? 'Backend online' : 'Backend offline'}
            </span>
            <span className={`status-badge ${c.sse.isConnected ? 'ok' : ''}`}>
              <Radio size={14} /> {c.sse.isConnected ? 'Live stream connected' : 'Live stream idle'}
            </span>
            {c.sessionId && <span className="status-badge mono" title="Session id">{c.sessionId.slice(0, 14)}…</span>}
          </div>
        </div>
      </header>

      {(online === false || c.sessionError) && (
        <div className="banner" role="alert">
          <b>Backend offline.</b> The pipeline (LocalStack → Flink → backend) isn't reachable on <code>/api</code>.
          Start it, then <button type="button" className="link" onClick={c.createSession}>retry</button>.
        </div>
      )}
      {c.sendError && online !== false && <div className="banner warn" role="alert">{c.sendError}</div>}

      <main className="layout">
        <div className="col-main">
          <RecordingBar
            micState={c.micState}
            micError={c.micError}
            speaker={state.speaker}
            onToggleSpeaker={() => c.dispatch({ type: 'toggleSpeaker' })}
            onSetSpeaker={(s) => c.dispatch({ type: 'setSpeaker', speaker: s })}
            onStart={c.startListening}
            onStop={c.stopListening}
            onDemo={c.runDemo}
            demoRunning={c.demoRunning}
            onReset={c.resetConversation}
            disabled={!ready}
          />
          <ConversationFeed state={state} onOpenEvent={openEvent} />
          <ManualInput onSend={(t) => c.sendFinal(t, state.speaker)} disabled={!ready} />
        </div>

        <div className="col-side">
          <ContextTracker context={state.context} focusedName={focused?.name ?? null} latest={state.latest} />
          <LivePanel lastList={lastList} focusedId={focusedId} onChoose={c.focusRestaurant} />
          <HistoryPanel sessionId={c.sessionId} />
        </div>
      </main>

      <footer className="footer">
        Data: Zomato Bangalore dataset (Kaggle) · Pipeline: Web Speech → FastAPI → Kinesis → Flink → Kinesis + DynamoDB → SSE
      </footer>

      <RecommendationPopup
        event={popup}
        focusedId={focusedId}
        onChoose={c.focusRestaurant}
        onOpenDetail={(seq) => { setDrawerSeq(seq); setPopup(null); }}
        onClose={closePopup}
      />

      {drawerEvent?.restaurant && (
        <>
          <div className="scrim" onClick={() => setDrawerSeq(null)} />
          <RestaurantDetail restaurant={drawerEvent.restaurant} answer={drawerEvent.answer} onClose={() => setDrawerSeq(null)} />
        </>
      )}
    </div>
  );
}
