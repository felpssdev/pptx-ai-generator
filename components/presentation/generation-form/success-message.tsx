'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle, Eye, Download } from 'lucide-react';

export interface SuccessMessageProps {
  slidesCount: number;
  onPreview?: () => void;
  onDownload?: () => void;
}

/**
 * Success message displayed after presentation generation
 * Shows completion with action buttons
 */
export const SuccessMessage = ({
  slidesCount,
  onPreview,
  onDownload,
}: SuccessMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto rounded-lg border-2 border-emerald-300 bg-emerald-50 p-6 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
        className="flex justify-center mb-4"
      >
        <CheckCircle className="h-16 w-16 text-emerald-600" />
      </motion.div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-emerald-900 mb-2">
        Presentation Generated!
      </h2>

      {/* Description */}
      <p className="text-emerald-700 mb-6">
        Your presentation with <span className="font-semibold">{slidesCount} slides</span> is ready.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y-2 border-emerald-300">
        <div>
          <p className="text-3xl font-bold text-emerald-600">{slidesCount}</p>
          <p className="text-xs text-emerald-700">Slides</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-emerald-600">✓</p>
          <p className="text-xs text-emerald-700">Complete</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-emerald-600">AI</p>
          <p className="text-xs text-emerald-700">Powered</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
        <Button
          variant="default"
          size="md"
          onClick={onPreview}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View Preview
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={onDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download PPTX
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs text-emerald-600 mt-4">
        You can now edit, preview, or download your presentation.
      </p>
    </motion.div>
  );
}
