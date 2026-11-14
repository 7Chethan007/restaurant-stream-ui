export const API_BASE = '/api';

export const SSE_EVENT_TYPES = {
  CONNECTION: 'connection',
  PING: 'ping',
  RECOMMENDATION: 'recommendation',
  ERROR: 'error',
} as const;

export const SSE_MAX_RECONNECT_ATTEMPTS = 10;
export const POPUP_AUTO_DISMISS_MS = 12_000;
export const DEMO_GAP_MS = 4_000;

/** A natural, continuous conversation: no speaker labels, the app simply listens. */
export const DEMO_SCRIPT: string[] = [
  "let's go out for food in Basavanagudi",
  'I am craving masala dosa',
  'something under 300 for two',
  'tell me about the first one',
  'how much does it cost',
  'what is on their menu',
  'how are the reviews',
];
