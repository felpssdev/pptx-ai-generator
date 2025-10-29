'use client';

import { SpeakerNotes } from '@/lib/types/speaker-notes';
import {
  parseScriptWithMarks,
  getMarkColor,
} from '@/lib/utils/speaker-notes-utils';
import {
  BookOpen,
  Clock,
  Lightbulb,
  Target,
} from 'lucide-react';

export interface SpeakerNotesPanelProps {
  notes: SpeakerNotes;
}

/**
 * Speaker Notes Panel Component
 *
 * Displays:
 * - Script with highlighted [MARKS]
 * - Tips for presenting
 * - Key points to emphasize
 * - Slide duration
 */
export const SpeakerNotesPanel = ({ notes }: SpeakerNotesPanelProps) => {
  const scriptParts = parseScriptWithMarks(notes.script);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
        <h2 className="text-lg font-semibold text-neutral-900">
          Speaker Notes
        </h2>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Script Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
              Script
            </h3>
          </div>
          <p className="text-lg leading-relaxed text-neutral-800 whitespace-pre-wrap">
            {scriptParts.map((part, idx) =>
              part.type === 'mark' ? (
                <span
                  key={idx}
                  className="font-semibold px-1 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getMarkColor(part.mark || '')}20`,
                    color: getMarkColor(part.mark || ''),
                  }}
                >
                  {part.content}
                </span>
              ) : (
                <span key={idx}>{part.content}</span>
              )
            )}
          </p>
        </section>

        {/* Tips Section */}
        {notes.tips && notes.tips.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                Tips
              </h3>
            </div>
            <ul className="space-y-2">
              {notes.tips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-base text-neutral-700 leading-relaxed"
                >
                  <span className="text-amber-600 font-bold flex-shrink-0 mt-1">
                    •
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Key Points Section */}
        {notes.keyPoints && notes.keyPoints.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-600" />
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                Key Points
              </h3>
            </div>
            <ul className="space-y-2">
              {notes.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-base text-neutral-700 leading-relaxed"
                >
                  <span className="text-brand-600 font-bold flex-shrink-0 mt-1">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Duration Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
              Duration
            </h3>
          </div>
          <div className="inline-block px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <p className="text-base font-semibold text-emerald-900">
              {notes.duration}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
