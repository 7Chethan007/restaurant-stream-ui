import type { ConversationContext, RecommendationEvent, SpeakerId, TranscriptLine } from '../types';

export interface ConversationState {
  lines: TranscriptLine[];
  partial: { speakerId: SpeakerId; text: string } | null;
  events: Record<string, RecommendationEvent>;
  eventOrder: string[];
  context: ConversationContext;
  speaker: SpeakerId;
  latest: RecommendationEvent | null;
}

export const EMPTY_CONTEXT: ConversationContext = {
  location: null, cuisines: [], dishes: [], maxCostForTwo: null, minRating: null, focusedRestaurantId: null,
};

export const initialConversation: ConversationState = {
  lines: [], partial: null, events: {}, eventOrder: [], context: EMPTY_CONTEXT, speaker: 'speaker_1', latest: null,
};

export type ConversationAction =
  | { type: 'partial'; text: string }
  | { type: 'final'; id: string; text: string; timestamp: number; speakerId?: SpeakerId }
  | { type: 'event'; event: RecommendationEvent }
  | { type: 'toggleSpeaker' }
  | { type: 'setSpeaker'; speaker: SpeakerId }
  | { type: 'reset' };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

export function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'partial':
      return { ...state, partial: { speakerId: state.speaker, text: action.text } };
    case 'final': {
      const line: TranscriptLine = {
        id: action.id, speakerId: action.speakerId ?? state.speaker, text: action.text, timestamp: action.timestamp,
      };
      return { ...state, partial: null, lines: [...state.lines, line] };
    }
    case 'event': {
      const e = action.event;
      if (state.events[e.sequenceNumber]) return state; // dedupe, like POD's processedSequenceNumbers
      // Attach the reaction to the newest transcript line with the same text that has none yet.
      const target = norm(e.transcript_text ?? '');
      let attached = false;
      const lines = [...state.lines];
      for (let i = lines.length - 1; i >= 0; i--) {
        if (!lines[i].eventSeq && (!target || norm(lines[i].text) === target)) {
          lines[i] = { ...lines[i], eventSeq: e.sequenceNumber };
          attached = true;
          break;
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
    case 'toggleSpeaker':
      return { ...state, speaker: state.speaker === 'speaker_1' ? 'speaker_2' : 'speaker_1' };
    case 'setSpeaker':
      return { ...state, speaker: action.speaker };
    case 'reset':
      return { ...initialConversation, speaker: state.speaker };
  }
}
