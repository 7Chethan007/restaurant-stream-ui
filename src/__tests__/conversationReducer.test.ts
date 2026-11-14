import { describe, expect, it } from 'vitest';
import { conversationReducer, initialConversation } from '../hooks/conversationReducer';
import type { RecommendationEvent } from '../types';

const ev = (seq: string, text: string): RecommendationEvent => ({
  sessionId: 's', sequenceNumber: seq, eventType: 'RECOMMENDATIONS', timestamp: 1, transcript_text: text,
  headline: 'h', recommendations: [],
  context: { location: 'Basavanagudi', cuisines: [], dishes: ['Masala Dosa'], maxCostForTwo: null, minRating: null, focusedRestaurantId: null },
});

describe('conversationReducer', () => {
  it('turns partial text into a final line', () => {
    let s = conversationReducer(initialConversation, { type: 'partial', text: 'i want' });
    expect(s.partial).toBe('i want');
    s = conversationReducer(s, { type: 'final', id: 'a', text: 'I want dosa', timestamp: 1 });
    expect(s.partial).toBeNull();
    expect(s.lines).toHaveLength(1);
  });

  it('attaches an event to the matching line, updates context, and dedupes by sequenceNumber', () => {
    let s = conversationReducer(initialConversation, { type: 'final', id: 'a', text: 'food in Basavanagudi', timestamp: 1 });
    s = conversationReducer(s, { type: 'final', id: 'b', text: 'I want masala dosa!', timestamp: 2 });
    s = conversationReducer(s, { type: 'event', event: ev('s-1', 'i want masala dosa') });
    expect(s.lines[1].eventSeq).toBe('s-1');
    expect(s.lines[0].eventSeq).toBeUndefined();
    expect(s.context.dishes).toEqual(['Masala Dosa']);
    const again = conversationReducer(s, { type: 'event', event: ev('s-1', 'i want masala dosa') });
    expect(again).toBe(s);
    expect(again.eventOrder).toHaveLength(1);
  });

  it('does not pin a text-less event (a chosen restaurant) to some other line', () => {
    let s = conversationReducer(initialConversation, { type: 'final', id: 'a', text: 'hello there', timestamp: 1 });
    s = conversationReducer(s, { type: 'event', event: ev('s-2', '') });
    expect(s.lines[0].eventSeq).toBeUndefined();
    expect(s.eventOrder).toEqual(['s-2']);
  });

  it('reset clears everything', () => {
    let s = conversationReducer(initialConversation, { type: 'final', id: 'a', text: 'x', timestamp: 1 });
    s = conversationReducer(s, { type: 'reset' });
    expect(s.lines).toHaveLength(0);
  });
});
