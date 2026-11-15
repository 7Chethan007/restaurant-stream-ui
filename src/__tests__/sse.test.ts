import { describe, expect, it } from 'vitest';
import { backoffDelay, isValidRecommendationEvent, parseSSEEventData } from '../utils/sse';

const valid = { sessionId: 's-1', sequenceNumber: 's-1-1', eventType: 'RECOMMENDATIONS', context: {} };

describe('SSE parsing', () => {
  it('parses JSON and returns null on garbage', () => {
    expect(parseSSEEventData('{"a":1}')).toEqual({ a: 1 });
    expect(parseSSEEventData('not json')).toBeNull();
  });
  it('validates the contract shape', () => {
    expect(isValidRecommendationEvent(valid)).toBe(true);
    expect(isValidRecommendationEvent({ ...valid, eventType: 'OTHER' })).toBe(false);
    expect(isValidRecommendationEvent({ ...valid, sequenceNumber: 7 })).toBe(false);
    expect(isValidRecommendationEvent(null)).toBe(false);
  });
  it('backs off exponentially with a cap', () => {
    expect(backoffDelay(0)).toBe(1000);
    expect(backoffDelay(2)).toBe(4000);
    expect(backoffDelay(10)).toBe(5000);
  });
});
