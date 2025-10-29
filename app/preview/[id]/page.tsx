'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Play,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { usePresentationStore } from '@/lib/store';
import { useBrandKitStore, TemplateType } from '@/lib/store';
import { TEMPLATES, applyBrandKit } from '@/lib/templates';
import {
  SlidePreviewGrid,
  SpeakerNotesPanel,
} from '@/components/presentation';
import { BrandKitUploader } from '@/components/brand-kit/brand-kit-uploader';
import { Button } from '@/components/ui';
import Link from 'next/link';

interface PreviewPageProps {
  params: {
    id: string;
  };
}

/**
 * Preview Page Component
 *
 * Full presentation preview with:
 * - Slide grid
 * - Template selector
 * - Brand kit customization
 * - Presentation mode launch
 * - PPTX export
 */
export default function PreviewPage({ params }: PreviewPageProps) {
  const { id } = params;
  const { presentation } = usePresentationStore();
  const { logo, colors, selectedTemplate, setTemplate } = useBrandKitStore();

  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Get current template with applied brand colors
  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate);
  const appliedTemplate = currentTemplate && colors
    ? applyBrandKit(currentTemplate, colors)
    : currentTemplate;

  const handleExportPPTX = useCallback(async () => {
    if (!presentation) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch('/api/presentations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: presentation.slides,
          brandKit: {
            logo,
            colors,
          },
          template: appliedTemplate,
          presentationTitle: presentation.title,
          presentationSubtitle: presentation.subtitle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentation.title.replace(/\s+/g, '-')}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  }, [presentation, appliedTemplate, logo, colors]);

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Presentation Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            The presentation you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/create">
            <Button>Create New Presentation</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedSlide = selectedSlideIndex !== null
    ? presentation.slides[selectedSlideIndex]
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/create">
              <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-neutral-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {presentation.title}
              </h1>
              <p className="text-sm text-neutral-500">{presentation.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {exportError && (
              <div className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {exportError}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Main: Slides Grid */}
        <div className="flex-1 min-w-0">
          <div className="space-y-6">
            {/* Slides Grid */}
            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Slides Preview
              </h2>
              <SlidePreviewGrid
                slides={presentation.slides}
                isGenerating={false}
                onSlideClick={(index) => setSelectedSlideIndex(index)}
              />
            </section>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-96 space-y-6">
          {/* Template Selector */}
          <section className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Templates
            </h3>
            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => setTemplate(template.id as TemplateType)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium text-neutral-900">{template.name}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {template.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Brand Kit Section */}
          <section className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Brand Kit
            </h3>
            <BrandKitUploader />
          </section>

          {/* Preview Info */}
          {logo && colors && (
            <section className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Brand Colors
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Primary', color: colors.primary },
                  { name: 'Secondary', color: colors.secondary },
                  { name: 'Accent', color: colors.accent },
                  { name: 'Background', color: colors.background },
                ].map(({ name, color }) => (
                  <div key={name} className="space-y-2">
                    <div
                      className="h-10 rounded-md border border-neutral-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-medium text-neutral-600">
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white sticky bottom-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            {presentation.slides.length} slides
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/presentation/${id}`}>
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Presentation Mode
              </Button>
            </Link>

            <Button
              onClick={handleExportPPTX}
              disabled={isExporting || !appliedTemplate}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Download PPTX'}
            </Button>
          </div>
        </div>
      </footer>

      {/* Modal: Slide Detail */}
      <AnimatePresence>
        {selectedSlide && selectedSlideIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSlideIndex(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {selectedSlide.title}
                </h2>
                <button
                  onClick={() => setSelectedSlideIndex(null)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>

              {/* Modal Body: Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Slide Content */}
                <div className="flex-1 flex flex-col items-center justify-center bg-neutral-100 p-8">
                  <div className="space-y-4 text-center max-w-2xl">
                    <h1 className="text-4xl font-bold text-neutral-900">
                      {selectedSlide.title}
                    </h1>
                    <div className="space-y-2">
                      {selectedSlide.bullets.map((bullet, idx) => (
                        <p
                          key={idx}
                          className="text-lg text-neutral-700 flex items-start gap-3"
                        >
                          <span className="text-brand-600 font-bold mt-1">
                            •
                          </span>
                          <span>{bullet}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Speaker Notes */}
                <div className="w-96 border-l border-neutral-200 overflow-hidden">
                  {selectedSlide.speakerNotes ? (
                    <SpeakerNotesPanel notes={selectedSlide.speakerNotes} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-400">
                      <p>No speaker notes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
                <p className="text-sm text-neutral-600">
                  Slide {selectedSlideIndex + 1} of {presentation.slides.length}
                </p>
                <button
                  onClick={() => setSelectedSlideIndex(null)}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
