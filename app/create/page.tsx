'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamingGeneration } from '@/lib/hooks/use-streaming-generation';
import { usePresentationStore, createPresentationFromResponse } from '@/lib/store';
import { SlidePreviewGrid } from '@/components/presentation/slide-preview/slide-preview-grid';
import { GenerationForm } from '@/components/presentation/generation-form/generation-form';
import { SuccessMessage } from '@/components/presentation/generation-form/success-message';

/**
 * Create page - Main generation interface
 * Handles presentation creation with streaming slides
 */
export default function CreatePage() {
  const [totalSlides, setTotalSlides] = useState(0);

  // Hooks
  const { slides, isGenerating, error, generate } =
    useStreamingGeneration();
  const { setPresentation, reset: resetStore } = usePresentationStore();

  // Debug logging
  console.log('CreatePage render:', {
    isGenerating,
    slidesCount: slides.length,
    totalSlides,
    showSuccess: !isGenerating && slides.length > 0,
  });

  /**
   * Handle generation form submission
   */
  const handleGenerate = useCallback(
    async (prompt: string, numSlides: number) => {
      try {
        setTotalSlides(numSlides);

        // Start streaming generation
        await generate(prompt, numSlides);
      } catch (err) {
        console.error('Generation error:', err);
        // Error is handled in hook
      }
    },
    [generate]
  );

  /**
   * Handle preview navigation
   */
  const handlePreview = useCallback(() => {
    if (slides.length > 0) {
      // Store presentation and navigate to preview page
      const presentation = createPresentationFromResponse({
        title: 'Generated Presentation',
        subtitle: 'Created with AI',
        slides,
      });
      setPresentation(presentation);

      // Navigate to preview page with ID
      window.location.href = `/preview/${presentation.id}`;
    }
  }, [slides, setPresentation]);

  /**
   * Handle download (placeholder)
   */
  const handleDownload = useCallback(() => {
    // TODO: Implement PPTX export
    alert('PPTX export coming soon!');
  }, []);

  /**
   * Handle reset
   */
  const handleReset = useCallback(() => {
    resetStore();
    setTotalSlides(0);
  }, [resetStore]);

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Create Presentation
          </h1>
          <p className="text-lg text-neutral-600">
            Generate professional presentations with AI in minutes
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
              >
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Rendering */}
          {!isGenerating && slides.length === 0 && (
            // Initial Form State
            <div className="space-y-8">
              <GenerationForm
                onSubmit={handleGenerate}
                isLoading={isGenerating}
              />

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid gap-4 md:grid-cols-3 mt-12"
              >
                {[
                  {
                    icon: '⚡',
                    title: 'Fast Generation',
                    description: 'Create presentations in seconds, not hours',
                  },
                  {
                    icon: '🎨',
                    title: 'Professional Design',
                    description: 'Beautiful, modern slide layouts included',
                  },
                  {
                    icon: '🔧',
                    title: 'Fully Editable',
                    description: 'Download PPTX and customize as needed',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="rounded-lg border border-neutral-200 p-4 text-center"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-neutral-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Generation in Progress */}
          {isGenerating && (
            <div className="space-y-6">
              <SlidePreviewGrid
                slides={slides}
                isGenerating={isGenerating}
                totalSlides={totalSlides}
              />
            </div>
          )}

          {/* Success State */}
          {!isGenerating && slides.length > 0 && (
            <div className="space-y-8">
              <SuccessMessage
                slidesCount={slides.length}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />

              {/* Generated Slides Preview */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                  Your Slides
                </h2>
                <SlidePreviewGrid
                  slides={slides}
                  isGenerating={false}
                  totalSlides={slides.length}
                />
              </div>

              {/* Reset Button */}
              <div className="text-center pt-4">
                <button
                  onClick={handleReset}
                  className="text-sm text-neutral-600 hover:text-neutral-900 underline"
                >
                  Create another presentation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
