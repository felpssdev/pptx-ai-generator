'use client';

import { motion } from 'framer-motion';
import { Slide } from '@/lib/ai';
import { SlidePreviewItem } from './slide-preview-item';
import { Skeleton, Progress } from '@/components/ui';

export interface SlidePreviewGridProps {
  slides: Slide[];
  isGenerating: boolean;
  totalSlides?: number;
  onSlideClick?: (index: number) => void;
  showClickHint?: boolean; // Whether to show "Click to view details" on cards
}

/**
 * Grid container for slide previews with loading states
 * Displays slides in responsive grid with skeleton loaders while generating
 */
export const SlidePreviewGrid = ({
  slides,
  isGenerating,
  totalSlides = 0,
  onSlideClick,
  showClickHint = true,
}: SlidePreviewGridProps) => {
  // Calculate progress percentage
  const progressPercent =
    totalSlides > 0 ? Math.round((slides.length / totalSlides) * 100) : 0;

  // Calculate remaining skeletons to show (only what's needed)
  const remainingSkeletons = Math.max(0, totalSlides - slides.length);
  const skeletonsToShow = isGenerating ? remainingSkeletons : 0;

  // Empty state
  if (slides.length === 0 && !isGenerating) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-600">
            No slides yet. Generate a presentation to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Section */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-blue-900">
                Generating presentation...
              </h3>
              <p className="text-xs text-blue-800">
                Slide {slides.length} of {totalSlides}
              </p>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} showLabel={false} />
        </motion.div>
      )}

          {/* Slides Grid */}
          <motion.div
            className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
        {/* Rendered Slides */}
        {slides.map((slide, index) => (
          <SlidePreviewItem
            key={slide.id}
            slide={slide}
            index={index}
            onClick={() => onSlideClick?.(index)}
            showClickHint={showClickHint}
          />
        ))}

        {/* Loading Skeletons */}
        {isGenerating &&
          Array.from({ length: skeletonsToShow }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: (slides.length + index) * 0.05,
                duration: 0.3,
              }}
            >
              <Skeleton
                className="h-full w-full"
                style={{ aspectRatio: '16 / 9' }}
              />
            </motion.div>
          ))}
      </motion.div>

      {/* Loading Message */}
      {isGenerating && slides.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Generating slides {slides.length + 1} of {totalSlides}...
          </div>
        </motion.div>
      )}
    </div>
  );
}
