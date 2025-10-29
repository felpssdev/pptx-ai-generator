import { SPEAKER_MARKS } from '@/lib/types/speaker-notes';

/**
 * Regex to match [MARK] patterns
 */
const MARK_PATTERN = new RegExp(`\\[(${SPEAKER_MARKS.join('|')})\\]`, 'gi');

/**
 * Parse script text and return parts with marks highlighted
 */
export function parseScriptWithMarks(
  script: string
): Array<{ type: 'text' | 'mark'; content: string; mark?: string }> {
  const parts: Array<{ type: 'text' | 'mark'; content: string; mark?: string }> =
    [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  MARK_PATTERN.lastIndex = 0;

  while ((match = MARK_PATTERN.exec(script)) !== null) {
    // Add text before mark
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: script.slice(lastIndex, match.index),
      });
    }

    // Add mark
    const mark = match[1].toUpperCase();
    parts.push({
      type: 'mark',
      content: `[${mark}]`,
      mark,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < script.length) {
    parts.push({
      type: 'text',
      content: script.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * Get color for a mark
 */
export function getMarkColor(mark: string): string {
  const colors: Record<string, string> = {
    PAUSE: '#fbbf24', // amber
    IMPORTANT: '#ef4444', // red
    EMPHASIZE: '#3b82f6', // blue
    TRANSITION: '#10b981', // emerald
    STORY: '#8b5cf6', // violet
    QUESTION: '#06b6d4', // cyan
    ACTION: '#f97316', // orange
  };

  return colors[mark] || '#6b7280';
}
