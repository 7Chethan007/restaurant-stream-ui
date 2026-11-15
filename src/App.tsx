import { Radio, Server, WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContextTracker } from './components/ContextTracker';
import { ConversationFeed } from './components/ConversationFeed';
import { HistoryPanel } from './components/HistoryPanel';
import { LivePanel } from './components/LivePanel';
import { HowItWorks } from './components/HowItWorks';
import { QuickActions } from './components/QuickActions';
import { RecommendationPopup } from './components/RecommendationPopup';
import { RecordingBar } from './components/RecordingBar';
import { RestaurantDetail } from './components/RestaurantDetail';
import { SiteNav } from './components/SiteNav';
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
    <div className="tw-app">
      <header className="tw-hero">
        <SiteNav />
        <div className="tw-hero-inner">
          <h1>Talk about food<br />We find the table</h1>
          <p className="tw-hero-sub">An always-listening digital twin streams every sentence through Kinesis and Apache Flink,
            and pops up the right place from 12,000+ Bangalore restaurants. Just talk.</p>

          <RecordingBar
            micState={c.micState}
            micError={c.micError}
            onStart={c.startListening}
            onStop={c.stopListening}
            disabled={!ready}
          />

          <div className="tw-status-row">
            <span className={`tw-status ${online ? 'is-ok' : online === false ? 'is-bad' : ''}`}>
              {online === false ? <WifiOff size={14} /> : <Server size={14} />}
              {online == null ? 'Checking backend…' : online ? 'Backend online' : 'Backend offline'}
            </span>
            <span className={`tw-status ${c.sse.isConnected ? 'is-ok' : ''}`}>
              <Radio size={14} /> {c.sse.isConnected ? 'Live stream connected' : 'Live stream idle'}
            </span>
          </div>
        </div>
      </header>

      {(online === false || c.sessionError) && (
        <div className="tw-banner" role="alert">
          <b>Backend offline.</b> The pipeline (Floci → Flink → backend) isn't reachable on <code>/api</code>.
          Start it, then <button type="button" className="tw-link" onClick={c.createSession}>retry</button>.
        </div>
      )}
      {c.sendError && online !== false && <div className="tw-banner is-warn" role="alert">{c.sendError}</div>}

      <section id="live" className="tw-section tw-grey">
        <div className="row">
          <h2>The conversation, live</h2>
          <p className="long-copy tw-lead">Every sentence, and what the twin made of it.</p>
          <div className="tw-grid">
            <div className="tw-col">
              <ConversationFeed state={state} onOpenEvent={openEvent} />
            </div>
            <div className="tw-col">
              <ContextTracker context={state.context} focusedName={focused?.name ?? null} />
              <LivePanel lastList={lastList} focusedId={focusedId} onChoose={c.focusRestaurant} />
              <HistoryPanel sessionId={c.sessionId} />
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <footer>
        <div className="row">
          <ul className="footer-nav">
            <li><a href="/">Home</a></li>
            <li><a href="#live">Live</a></li>
            <li><a href="#how">How it works</a></li>
          </ul>
        </div>
        <div className="row">
          <p>Data: Zomato Bangalore dataset (Kaggle) · Web Speech → FastAPI → Kinesis → Flink → Kinesis + DynamoDB → SSE</p>
        </div>
      </footer>

      <QuickActions
        onSend={(t) => c.sendFinal(t)}
        onDemo={c.runDemo}
        demoRunning={c.demoRunning}
        onReset={c.resetConversation}
        disabled={!ready}
      />

      <RecommendationPopup
        event={popup}
        focusedId={focusedId}
        onChoose={c.focusRestaurant}
        onOpenDetail={(seq) => { setDrawerSeq(seq); setPopup(null); }}
        onClose={closePopup}
      />

      {drawerEvent?.restaurant && (
        <>
          <div className="tw-scrim" onClick={() => setDrawerSeq(null)} />
          <RestaurantDetail restaurant={drawerEvent.restaurant} answer={drawerEvent.answer} onClose={() => setDrawerSeq(null)} />
        </>
      )}
    </div>
  );
}
