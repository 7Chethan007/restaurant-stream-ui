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

export const SPEAKERS = {
  speaker_1: { label: 'Speaker 1', short: 'S1' },
  speaker_2: { label: 'Speaker 2', short: 'S2' },
} as const;

export const DEMO_SCRIPT: { speakerId: 'speaker_1' | 'speaker_2'; text: string }[] = [
  { speakerId: 'speaker_1', text: "let's go out for food in Basavanagudi" },
  { speakerId: 'speaker_2', text: 'I am craving masala dosa' },
  { speakerId: 'speaker_1', text: 'something under 300 for two' },
  { speakerId: 'speaker_2', text: 'tell me about the first one' },
  { speakerId: 'speaker_1', text: 'how much does it cost' },
  { speakerId: 'speaker_2', text: 'what is on their menu' },
  { speakerId: 'speaker_1', text: 'how are the reviews' },
];
