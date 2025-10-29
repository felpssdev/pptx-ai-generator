'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { Upload } from 'lucide-react';

export interface GenerationFormProps {
  onSubmit: (prompt: string, numSlides: number) => Promise<void>;
  isLoading?: boolean;
}

const SLIDE_OPTIONS = [
  { value: 3, label: '3 Slides (Quick)' },
  { value: 5, label: '5 Slides (Recommended)' },
  { value: 8, label: '8 Slides (Detailed)' },
  { value: 10, label: '10 Slides (Full)' },
];

/**
 * Form component for generating presentations
 * Collects prompt, template, and slide count
 */
export const GenerationForm = ({
  onSubmit,
  isLoading = false,
}: GenerationFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [numSlides, setNumSlides] = useState(5);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const isValid = prompt.trim().length >= 5;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      try {
        await onSubmit(prompt, numSlides);
      } catch (error) {
        console.error('Generation failed:', error);
      }
    },
    [prompt, numSlides, onSubmit, isValid]
  );

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setLogoFile(file);
      }
    },
    []
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
    >
      {/* Prompt Input */}
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-semibold text-neutral-900">
          Presentation Topic
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          placeholder="Describe what your presentation should be about. Be specific! (e.g., 'A presentation about machine learning fundamentals for business leaders')"
          className="w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:bg-neutral-100 disabled:text-neutral-500 resize-none"
          rows={4}
        />
        <p className="text-xs text-neutral-500">
          {prompt.length}/500 characters
        </p>
      </div>

      {/* Slide Count Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-900">
          Number of Slides
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SLIDE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setNumSlides(option.value)}
              disabled={isLoading}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                numSlides === option.value
                  ? 'bg-brand-600 text-white ring-2 ring-brand-500 ring-offset-2'
                  : 'border border-neutral-300 bg-white text-neutral-900 hover:border-brand-400 disabled:opacity-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Upload (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-900">
          Brand Logo (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={handleLogoChange}
            disabled={isLoading}
            className="hidden"
          />
          <label
            htmlFor="logo"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            <Upload className="h-5 w-5 text-neutral-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700">
                {logoFile ? logoFile.name : 'Click to upload logo'}
              </p>
              <p className="text-xs text-neutral-500">PNG, JPG or SVG</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          isLoading={isLoading}
          loadingText="Generating..."
          size="lg"
          className="flex-1"
        >
          Generate Presentation
        </Button>
      </div>

      {/* Info Message */}
      <p className="text-xs text-neutral-500 text-center">
        Typically takes 30-60 seconds depending on slide count.
      </p>
    </motion.form>
  );
}
