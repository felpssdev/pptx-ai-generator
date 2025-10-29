import { Slide, PresentationResponse } from '@/lib/ai';

/**
 * SSE Event types from streaming API
 */
export interface SSEChunkEvent {
  type: 'chunk';
  data: string;
}

export interface SSESlideEvent {
  type: 'slide';
  data: Slide;
}

export interface SSECompleteEvent {
  type: 'complete';
  data: PresentationResponse | null;
}

export interface SSEErrorEvent {
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}

export type SSEEventType =
  | SSEChunkEvent
  | SSESlideEvent
  | SSECompleteEvent
  | SSEErrorEvent;

/**
 * Parse SSE event data
 */
export function parseSSEEvent(message: string): SSEEventType | null {
  try {
    const parsed = JSON.parse(message);
    if (parsed.type && parsed.data !== undefined) {
      return parsed as SSEEventType;
    }
  } catch {
    // Invalid JSON, skip
  }
  return null;
}
