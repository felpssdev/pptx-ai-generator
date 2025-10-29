'use client';

import { motion } from 'framer-motion';
import { Slide } from '@/lib/ai';
import { SlidePreviewItem } from './slide-preview-item';

export interface SlidePreviewGridProps {
  slides: Slide[];
  selectedSlideId?: string;
  onSlideSelect?: (slide: Slide, index: number) => void;
}

/**
 * Grid container for slide previews
 * Displays slides in responsive grid with staggered animations
 */
export const SlidePreviewGrid = ({
  slides,
  selectedSlideId,
  onSlideSelect,
}: SlidePreviewGridProps) => {
  if (slides.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300">
        <p className="text-center text-neutral-500">
          No slides yet. Generate a presentation to get started!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {slides.map((slide, index) => (
        <SlidePreviewItem
          key={slide.id}
          slide={slide}
          index={index}
          isSelected={slide.id === selectedSlideId}
          onClick={() => onSlideSelect?.(slide, index)}
        />
      ))}
    </motion.div>
  );
}
