/**
 * Speaker notes for a slide
 */
export interface SpeakerNotes {
  script: string; // 2-3 paragraphs, natural and conversational
  duration: string; // e.g., "2min 30s"
  tips: string[]; // Tips for presenting this slide
  keyPoints: string[]; // Key points to emphasize
}

/**
 * Highlight pattern for marked text like [PAUSE], [IMPORTANT], etc.
 */
export const SPEAKER_MARKS = [
  'PAUSE',
  'IMPORTANT',
  'EMPHASIZE',
  'TRANSITION',
  'STORY',
  'QUESTION',
  'ACTION',
] as const;
