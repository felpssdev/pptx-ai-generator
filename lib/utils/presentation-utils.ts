import { SpeakerNotes } from '@/lib/types/speaker-notes';

/**
 * Parse duration string like "2min 30s" to total seconds
 */
export function parseDurationToSeconds(duration: string): number {
  let seconds = 0;

  const minutesMatch = duration.match(/(\d+)\s*min/i);
  if (minutesMatch) {
    seconds += parseInt(minutesMatch[1]) * 60;
  }

  const secondsMatch = duration.match(/(\d+)\s*s(?!l)/i);
  if (secondsMatch) {
    seconds += parseInt(secondsMatch[1]);
  }

  return seconds;
}

/**
 * Format seconds to "Xmin Ys" or just "Xs"
 */
export function formatSecondsToTime(seconds: number): string {
  if (seconds <= 0) return '0s';

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes > 0 && secs > 0) {
    return `${minutes}min ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}min`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Calculate total duration from speaker notes
 */
export function calculateTotalDuration(notes: SpeakerNotes[]): number {
  return notes.reduce((total, note) => {
    if (note.duration) {
      return total + parseDurationToSeconds(note.duration);
    }
    return total;
  }, 0);
}
