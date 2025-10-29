'use client';

import { motion } from 'framer-motion';
import { Slide } from '@/lib/ai';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent } from '@/components/ui';
import { ImageIcon } from 'lucide-react';

export interface SlidePreviewItemProps {
  slide: Slide;
  index: number;
  onClick?: () => void;
  isSelected?: boolean;
  showClickHint?: boolean; // Whether to show "Click to view details" footer
}

/**
 * Animated slide preview card component
 * Displays slide title, bullets, and image placeholder
 */
export const SlidePreviewItem = ({
  slide,
  index,
  onClick,
  isSelected = false,
  showClickHint = true,
}: SlidePreviewItemProps) => {
  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        onClick={onClick}
        className={cn(
          'relative cursor-pointer overflow-hidden transition-all duration-200',
          'hover:shadow-xl hover:border-blue-300',
          isSelected && 'ring-2 ring-blue-500 shadow-lg',
          'h-full'
        )}
      >
        <CardContent className="flex h-full flex-col p-0">
          {/* Header Section with Badge and Number */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span
              className={cn(
                'inline-block rounded-md px-3 py-1.5 text-xs font-bold',
                'uppercase tracking-wider',
                slide.type === 'title' && 'bg-blue-600 text-white',
                slide.type === 'content' && 'bg-blue-500 text-white',
                slide.type === 'conclusion' && 'bg-purple-600 text-white'
              )}
            >
              {slide.type}
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-700">
              {index + 1}
            </span>
          </div>

          {/* Content Section - Centered and Clean */}
          <div className="flex-1 px-5 py-4 flex flex-col justify-center">
            {/* Title - Large and prominent */}
            <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-4">
              {slide.title}
            </h3>

            {/* Bullet Count & Info */}
            <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{slide.bullets.length} key points</span>
              </div>
              {slide.imagePrompt && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-neutral-500" />
                  <span>Image included</span>
                </div>
              )}
              {slide.speakerNotes && (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">Speaker notes</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer hint - only show if specified */}
          {showClickHint && (
            <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50">
              <p className="text-xs text-neutral-500 text-center">
                Click to view details
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
