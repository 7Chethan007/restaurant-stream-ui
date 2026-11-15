export interface Review {
  rating: number | null;
  text: string;
}

export interface RestaurantCard {
  id: string;
  name: string;
  address: string;
  location: string;
  restType: string;
  cuisines: string[];
  dishesLiked: string[];
  rating: number | null;
  votes: number;
  costForTwo: number | null;
  priceBand: string;
  onlineOrder: boolean;
  bookTable: boolean;
  phone: string;
  url: string;
  menuPreview: string[];
  menuCount: number;
  topReviews: Review[];
  score: number;
  matchedOn: string[];
}

export interface ConversationContext {
  location: string | null;
  cuisines: string[];
  dishes: string[];
  maxCostForTwo: number | null;
  minRating: number | null;
  focusedRestaurantId: string | null;
}

export type AnswerIntent =
  | 'PRICE' | 'MENU' | 'RATING' | 'REVIEWS' | 'ADDRESS'
  | 'CONTACT' | 'BOOKING' | 'DELIVERY' | 'OVERVIEW';

export interface Answer {
  intent: AnswerIntent;
  text: string;
  facts: { label: string; value: string }[];
}

export type EventType = 'RECOMMENDATIONS' | 'RESTAURANT_ANSWER' | 'NO_MATCH';

export interface RecommendationEvent {
  sessionId: string;
  sequenceNumber: string;
  eventType: EventType;
  timestamp: number;
  transcript_text: string;
  speakerId?: string;
  context: ConversationContext;
  headline: string;
  recommendations?: RestaurantCard[];
  restaurant?: RestaurantCard | null;
  answer?: Answer | null;
}

export interface TranscriptLine {
  id: string;
  text: string;
  timestamp: number;
  /** sequenceNumber of the event this line triggered, once it arrives */
  eventSeq?: string;
}

export interface HistoryItem {
  timestamp: number;
  transcript: string;
  event: RecommendationEvent;
}
