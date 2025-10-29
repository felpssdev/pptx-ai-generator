'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { SpeakerNotes } from '@/lib/types/speaker-notes';
import { SpeakerNotesPanel } from '../speaker-notes';
import {
  calculateTotalDuration,
  formatSecondsToTime,
} from '@/lib/utils/presentation-utils';

// Slide type that matches the AI generation response
export interface Slide {
  id: string;
  type: 'title' | 'content' | 'conclusion';
  title: string;
  bullets: string[];
  speakerNotes: SpeakerNotes;
  imagePrompt: string;
  imageUrl?: string;
}

export interface PresentationModeProps {
  slides: Slide[];
  onExit: () => void;
}

/**
 * Presentation Mode Component
 *
 * Fullscreen presentation view with:
 * - 70% slide area | 30% speaker notes
 * - Timer countdown
 * - Navigation controls
 * - Progress bar
 */
export const PresentationMode = ({
  slides,
  onExit,
}: PresentationModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSeconds] = useState(() => {
    const notes = slides
      .map((slide) => slide.speakerNotes)
      .filter((note): note is SpeakerNotes => note !== undefined);
    return calculateTotalDuration(notes);
  });
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFullscreenRef = useRef(false);

  const currentSlide = slides[currentIndex];
  const nextSlide = slides[currentIndex + 1];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  // Timer countdown
  useEffect(() => {
    if (totalSeconds === 0) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 0) {
            setIsPaused(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, totalSeconds]);

  const handleExit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onExit();
  }, [onExit]);

  // Handle keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          if (currentIndex < slides.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleExit();
          break;
      }
    },
    [currentIndex, slides.length, handleExit]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Request fullscreen on mount
  useEffect(() => {
    const root = document.documentElement;
    if (root.requestFullscreen && !isFullscreenRef.current) {
      root
        .requestFullscreen()
        .then(() => {
          isFullscreenRef.current = true;
        })
        .catch(() => {
          console.warn('Could not enter fullscreen');
        });
    }

    return () => {
      if (document.fullscreenElement && isFullscreenRef.current) {
        document.exitFullscreen().catch(() => {});
        isFullscreenRef.current = false;
      }
    };
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  if (!currentSlide) return null;

  return (
    <div className="w-screen h-screen bg-black flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Slide Area (70%) */}
        <div className="flex-[0.7] bg-neutral-900 flex flex-col items-center justify-center p-8 relative">
          {/* Slide Title */}
          <div className="absolute top-8 left-8 right-8">
            <h1 className="text-4xl font-bold text-white">
              {currentSlide.title}
            </h1>
          </div>

          {/* Slide Image or Placeholder */}
          <div className="w-full h-full max-w-5xl flex items-center justify-center">
            {currentSlide.imageUrl ? (
              <Image
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="text-center space-y-4">
                <Play className="w-24 h-24 text-neutral-600 mx-auto" />
                <p className="text-neutral-400 text-lg">
                  {currentSlide.bullets?.join('\n')}
                </p>
              </div>
            )}
          </div>

          {/* Slide Number */}
          <div className="absolute bottom-8 right-8">
            <p className="text-neutral-400 text-sm font-medium">
              {currentIndex + 1} / {slides.length}
            </p>
          </div>
        </div>

        {/* Speaker Notes Area (30%) */}
        <div className="flex-[0.3] bg-white overflow-hidden flex flex-col border-l border-neutral-300">
          {currentSlide.speakerNotes ? (
            <SpeakerNotesPanel notes={currentSlide.speakerNotes} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <p>No speaker notes</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-neutral-900 border-t border-neutral-700 px-8 py-4 space-y-3">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous (←)"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next (→)"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-5 bg-neutral-600" />

            {/* Slide Number */}
            <p className="text-sm text-neutral-300 font-medium">
              {currentIndex + 1} / {slides.length}
            </p>
          </div>

          {/* Center: Timer and Next Slide Preview */}
          <div className="flex items-center gap-6">
            {/* Next Slide Preview */}
            {nextSlide && (
              <div className="text-sm text-neutral-400">
                <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                  Next
                </p>
                <p className="font-medium text-white truncate max-w-xs">
                  {nextSlide.title}
                </p>
              </div>
            )}

            <div className="w-px h-8 bg-neutral-600" />

            {/* Timer */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Time
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {formatSecondsToTime(remainingSeconds)}
                </p>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="ml-2 px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>

          {/* Right: Exit Button */}
          <button
            onClick={handleExit}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Exit (Esc)"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="text-xs text-neutral-500 flex justify-center gap-6">
          <span>→ Space: Next</span>
          <span>← : Previous</span>
          <span>Esc: Exit</span>
        </div>
      </div>
    </div>
  );
};
