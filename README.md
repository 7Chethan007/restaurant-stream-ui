# restaurant-stream-ui

The **digital twin** front end of the restaurant-stream pipeline. It listens to two
people talking about food, streams every finished sentence into the pipeline, and
pops up restaurant suggestions — and answers about a chosen place — as soon as Flink
produces them. No "Ask" button: it is always listening.

Modelled on the POD Health doctor app's digital twin (persistent transcription →
Kinesis → Flink → SSE → popups), styled after the Omnifood/HotelWebsite look
(Lato, `#e67e22`, warm dark hero).

## Where it sits

```
Browser (this repo)
  Web Speech API (continuous, auto-restart) ──► POST /api/sessions/{id}/transcripts
  EventSource  ◄── GET /api/sessions/{id}/stream   (connection · ping · recommendation · error)
        │
restaurant-stream-backend ──► Kinesis restaurant-transcripts ──► restaurant-stream-flink
        ▲                                                              │
        └──────── Kinesis restaurant-recommendations ◄────────────────┘ (+ DynamoDB history)
```

The UI only talks to the backend (relative `/api` and `/health`). The API and event
shapes are defined by the backend contract; see `src/types/index.ts`.

## Layout

| Path | What |
|---|---|
| `src/utils/persistentSpeechRecognition.ts` | Always-on `SpeechRecognition` singleton (states `DISCONNECTED/CONNECTING/RECORDING/RECONNECTING/ERROR`, restarts with backoff, stops on permission denial) |
| `src/hooks/useSessionSSE.ts` | Per-session EventSource with reconnect backoff |
| `src/hooks/useConversation.ts` | Session lifecycle, sending transcripts, mic, demo script, focus/reset |
| `src/hooks/conversationReducer.ts` | Transcript lines per speaker, events deduped by `sequenceNumber`, latest context |
| `src/hooks/usePopupManager.ts` | Draggable popup position |
| `src/components/RecordingBar.tsx` | The hero's call to action: start/stop, HH:MM:SS timer, live waveform (`AudioVisualizer`),  |
| `src/components/QuickActions.tsx` | Bottom-right floating button: type a line, play the demo conversation, reset |
| `src/components/ConversationFeed.tsx` | Chat bubbles per speaker + the system's reaction under each line |
| `src/components/ContextTracker.tsx` | Location · Cuisine · Dish · Budget · Chosen place |
| `src/components/RecommendationPopup.tsx` | Glass popup per event; auto-dismisses after 12 s unless hovered |
| `src/components/RestaurantDetail.tsx` | Answer drawer for the chosen place (price, menu, reviews, contact) |
| `src/components/HistoryPanel.tsx` | Stored turns for the session (DynamoDB, via the backend) |
| `src/components/HowItWorks.tsx`, `src/hooks/useReveal.ts` | "Simple as 1, 2, 3" section, fade-in on scroll |

## Run

**Dev** (needs the backend on `:8000`, or set `BACKEND_URL`):

```bash
npm install
npm run dev          # http://localhost:5173, proxies /api and /health
```

**Docker** (joins the shared `restaurant-stream-net` network; backend service must be `backend`):

```bash
docker compose up -d --build   # http://localhost:5173
```

| Env var | Default | Used by |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8000` (dev) / `http://backend:8000` (Docker) | Vite proxy / nginx |
| `NGINX_RESOLVER` | `127.0.0.11` (Docker DNS) | nginx, to resolve the backend per request. Set to your cluster DNS elsewhere |

Optional: drop a photo at `public/img/hero.jpg` for the hero background (a warm gradient is used otherwise).

## Test

```bash
npm test             # vitest: formatters, SSE parsing/validation, conversation reducer
npm run build        # type-check + production bundle
```

**Without a mic:** open the round orange button in the bottom-right corner and press **Play demo conversation**. It sends a scripted two-person
chat through the real API (via the backend → Kinesis on Floci → Flink) (Basavanagudi → masala dosa → under ₹300 → "tell me about the
first one" → price → menu → reviews), 4 s apart. Popups and the context tracker should update after each line.

**With a mic:** open http://localhost:5173 in **Chrome** (the Web Speech API is Chrome-only),
press **Start listening**, allow the microphone, and talk. Press **Tab** (or click the chips)
to switch between Speaker 1 and Speaker 2 — the browser cannot tell voices apart, so the
current speaker is attached to each sentence. Click **Choose this place** on a card, then ask
"how much does it cost?" or "what's on the menu?".

Note: Zomato's data lists menu dish names only, with no per-dish prices — price answers use cost for two.

## Pages

- `/` is the Omnifood hotel site (copied from `7Chethan007/HotelWebsite` into `public/`), plus one nav pill, "Digital Twin Lab".
- `/digital-twin/` is the React lab. It reuses the hotel stylesheets, so nav, buttons and headings match.
- Vite builds both pages (`vite.config.ts`). nginx serves `/digital-twin/` through its directory index (`try_files $uri $uri/`).
- There are no speakers: the page just listens. The bottom-right button holds typing, the demo conversation and reset.
