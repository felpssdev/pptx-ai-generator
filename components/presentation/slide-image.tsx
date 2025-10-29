'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImageIcon, AlertCircle } from 'lucide-react';
import { BrandColors } from '@/lib/utils/color-extraction';

export interface SlideImageProps {
  imagePrompt?: string;
  brandColors: BrandColors;
  alt: string;
}

type ImageState = 'generating' | 'loading' | 'loaded' | 'error';

/**
 * Slide Image Component
 *
 * Displays an image with loading states:
 * - generating: Placeholder with gradient and shimmer
 * - loading: Image loading
 * - loaded: Image displayed with fade-in
 * - error: Elegant error gradient
 */
export const SlideImage = ({
  imagePrompt,
  brandColors,
  alt,
}: SlideImageProps) => {
  const [state, setState] = useState<ImageState>(
    imagePrompt ? 'generating' : 'error'
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imagePrompt) {
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const generateImage = async () => {
      try {
        if (isMounted) setState('loading');

        const response = await fetch('/api/images/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (isMounted) setState('error');
          return;
        }

        const data = (await response.json()) as { url: string | null };

        if (isMounted) {
          if (data.url) {
            setImageUrl(data.url);
            setState('loaded');
          } else {
            setState('error');
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Image generation error:', error);
        }
        if (isMounted) {
          setState('error');
        }
      }
    };

    generateImage();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [imagePrompt]);

  // Placeholder with shimmer
  if (state === 'generating' || state === 'loading') {
    return (
      <div
        className="w-full h-64 rounded-lg overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.accent} 100%)`,
        }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{ x: [-100, 400] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ImageIcon className="w-12 h-12 text-white opacity-60" />
          </motion.div>
          <p className="text-sm font-medium text-white opacity-60">
            {state === 'generating' ? 'Generating...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Loaded state
  if (state === 'loaded' && imageUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-64 rounded-lg overflow-hidden relative bg-neutral-100"
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
        />
      </motion.div>
    );
  }

  // Error state
  return (
    <div
      className="w-full h-64 rounded-lg overflow-hidden relative flex flex-col items-center justify-center gap-3"
      style={{
        background: `linear-gradient(135deg, ${brandColors.background} 0%, ${brandColors.accent}20 100%)`,
        border: `1px solid ${brandColors.accent}40`,
      }}
    >
      <AlertCircle className="w-10 h-10 text-neutral-400" />
      <p className="text-sm font-medium text-neutral-600">
        Image not available
      </p>
    </div>
  );
};
