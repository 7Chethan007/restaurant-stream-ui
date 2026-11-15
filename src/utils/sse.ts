import type { RecommendationEvent } from '../types';

export function parseSSEEventData<T = unknown>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function isValidRecommendationEvent(e: unknown): e is RecommendationEvent {
  if (!e || typeof e !== 'object') return false;
  const o = e as Record<string, unknown>;
  return (
    typeof o.sessionId === 'string' &&
    typeof o.sequenceNumber === 'string' &&
    (o.eventType === 'RECOMMENDATIONS' || o.eventType === 'RESTAURANT_ANSWER' || o.eventType === 'NO_MATCH') &&
    typeof o.context === 'object' && o.context !== null
  );
}

/** Exponential backoff with a ceiling, like POD's calculateExponentialBackoff. */
export function backoffDelay(attempt: number, baseMs = 1000, capMs = 5000): number {
  return Math.min(capMs, baseMs * 2 ** attempt);
}
