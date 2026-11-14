import { describe, expect, it } from 'vitest';
import { conversationReducer, initialConversation } from '../hooks/conversationReducer';
import type { RecommendationEvent } from '../types';

const ev = (seq: string, text: string): RecommendationEvent => ({
  sessionId: 's', sequenceNumber: seq, eventType: 'RECOMMENDATIONS', timestamp: 1, transcript_text: text,
  speakerId: 'speaker_1', headline: 'h', recommendations: [],
  context: { location: 'Basavanagudi', cuisines: [], dishes: ['Masala Dosa'], maxCostForTwo: null, minRating: null, focusedRestaurantId: null },
});

describe('conversationReducer', () => {
  it('toggles speaker and stamps final lines with the current speaker', () => {
    let s = conversationReducer(initialConversation, { type: 'toggleSpeaker' });
    expect(s.speaker).toBe('speaker_2');
    s = conversationReducer(s, { type: 'partial', text: 'i want' });
    expect(s.partial).toEqual({ speakerId: 'speaker_2', text: 'i want' });
    s = conversationReducer(s, { type: 'final', id: 'a', text: 'I want dosa', timestamp: 1 });
    expect(s.partial).toBeNull();
    expect(s.lines[0].speakerId).toBe('speaker_2');
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

  it('reset clears everything but keeps the speaker', () => {
    let s = conversationReducer(initialConversation, { type: 'setSpeaker', speaker: 'speaker_2' });
    s = conversationReducer(s, { type: 'final', id: 'a', text: 'x', timestamp: 1 });
    s = conversationReducer(s, { type: 'reset' });
    expect(s.lines).toHaveLength(0);
    expect(s.speaker).toBe('speaker_2');
  });
});
