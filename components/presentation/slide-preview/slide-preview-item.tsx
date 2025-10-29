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
          'relative cursor-pointer overflow-hidden transition-shadow duration-200',
          'hover:shadow-lg',
          isSelected && 'ring-2 ring-brand-500 shadow-lg'
        )}
        style={{ aspectRatio: '16 / 9' }}
      >
        <CardContent className="flex h-full flex-col p-4">
          {/* Image Placeholder / Background */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-gradient-to-br from-neutral-100 to-neutral-50',
              'opacity-50'
            )}
          >
            {slide.imagePrompt ? (
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-neutral-300" />
              </div>
            ) : (
              <div className="text-neutral-200">
                <ImageIcon className="mx-auto h-12 w-12" />
              </div>
            )}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col">
            {/* Slide Type Badge */}
            <div className="mb-2 flex items-start justify-between">
              <span
                className={cn(
                  'inline-block rounded-sm px-2 py-1 text-xs font-semibold',
                  'uppercase tracking-wider',
                  slide.type === 'title' && 'bg-brand-500 text-white',
                  slide.type === 'content' && 'bg-blue-500 text-white',
                  slide.type === 'conclusion' && 'bg-purple-500 text-white'
                )}
              >
                {slide.type}
              </span>

              {/* Slide Number */}
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-bold',
                  'bg-white/80 text-neutral-700'
                )}
              >
                {index + 1}
              </span>
            </div>

            {/* Title */}
            <h3
              className={cn(
                'line-clamp-2 text-sm font-bold leading-tight',
                'text-neutral-900',
                'mb-2'
              )}
            >
              {slide.title}
            </h3>

            {/* Bullets */}
            <div className="flex-1 space-y-1">
              {slide.bullets.slice(0, 3).map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex gap-2"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-neutral-600" />
                  <p
                    className={cn(
                      'line-clamp-1 text-xs leading-snug',
                      'text-neutral-700'
                    )}
                  >
                    {bullet}
                  </p>
                </div>
              ))}

              {/* Show more indicator */}
              {slide.bullets.length > 3 && (
                <div className="pt-1 text-xs text-neutral-500">
                  +{slide.bullets.length - 3} more
                </div>
              )}
            </div>

            {/* Speaker Notes Indicator */}
            {slide.speakerNotes && (
              <div className="mt-2 flex gap-1 text-xs text-neutral-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Speaker notes</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
