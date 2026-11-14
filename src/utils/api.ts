import { API_BASE } from '../constants';
import type { HistoryItem, SpeakerId } from '../types';

async function post(path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res;
}

export const api = {
  async createSession(): Promise<string> {
    const res = await post('/sessions');
    return (await res.json()).sessionId as string;
  },
  sendTranscript(sessionId: string, text: string, speakerId: SpeakerId, confidence = 1, isPartial = false) {
    return post(`/sessions/${encodeURIComponent(sessionId)}/transcripts`, { text, speakerId, confidence, isPartial });
  },
  focus(sessionId: string, restaurantId: string) {
    return post(`/sessions/${encodeURIComponent(sessionId)}/focus`, { restaurantId });
  },
  reset(sessionId: string) {
    return post(`/sessions/${encodeURIComponent(sessionId)}/reset`);
  },
  async history(sessionId: string, limit = 50): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/history?limit=${limit}`);
    if (!res.ok) throw new Error(`history failed: ${res.status}`);
    return (await res.json()).items as HistoryItem[];
  },
  async health(): Promise<boolean> {
    try {
      const res = await fetch('/health', { cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  },
};
