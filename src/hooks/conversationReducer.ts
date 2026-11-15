import type { ConversationContext, RecommendationEvent, TranscriptLine } from '../types';

export interface ConversationState {
  lines: TranscriptLine[];
  partial: string | null;
  events: Record<string, RecommendationEvent>;
  eventOrder: string[];
  context: ConversationContext;
  latest: RecommendationEvent | null;
}

export const EMPTY_CONTEXT: ConversationContext = {
  location: null, cuisines: [], dishes: [], maxCostForTwo: null, minRating: null, focusedRestaurantId: null,
};

export const initialConversation: ConversationState = {
  lines: [], partial: null, events: {}, eventOrder: [], context: EMPTY_CONTEXT, latest: null,
};

export type ConversationAction =
  | { type: 'partial'; text: string }
  | { type: 'final'; id: string; text: string; timestamp: number }
  | { type: 'event'; event: RecommendationEvent }
  | { type: 'reset' };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

export function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'partial':
      return { ...state, partial: action.text };
    case 'final': {
      const line: TranscriptLine = { id: action.id, text: action.text, timestamp: action.timestamp };
      return { ...state, partial: null, lines: [...state.lines, line] };
    }
    case 'event': {
      const e = action.event;
      if (state.events[e.sequenceNumber]) return state; // dedupe, like POD's processedSequenceNumbers
      // Attach the reaction to the newest line with the same text that has none yet.
      // Events without text (a chosen restaurant) belong to no line.
      const target = norm(e.transcript_text ?? '');
      const lines = [...state.lines];
      let attached = false;
      if (target) {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (!lines[i].eventSeq && norm(lines[i].text) === target) {
            lines[i] = { ...lines[i], eventSeq: e.sequenceNumber };
            attached = true;
            break;
          }
        }
      }
      return {
        ...state,
        lines: attached ? lines : state.lines,
        events: { ...state.events, [e.sequenceNumber]: e },
        eventOrder: [...state.eventOrder, e.sequenceNumber],
        context: e.context ?? state.context,
        latest: e,
      };
    }
    case 'reset':
      return initialConversation;
  }
}
