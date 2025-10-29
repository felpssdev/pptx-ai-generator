'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrandKitStore } from '@/lib/store';
import { Upload, Check, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Brand Kit Logo Uploader with drag & drop
 * Uploads logo and automatically extracts brand colors
 */
export const BrandKitUploader = () => {
  const [dragActive, setDragActive] = useState(false);
  const { logo, isLoading, error, uploadLogo, reset, colors } =
    useBrandKitStore();

  /**
   * Handle file selection
   */
  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PNG, JPEG, or SVG file');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File size must be less than 5MB. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      try {
        await uploadLogo(file);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    },
    [uploadLogo]
  );

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  /**
   * Handle reset
   */
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      {!logo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors',
            dragActive
              ? 'border-brand-400 bg-brand-50'
              : 'border-neutral-300 bg-neutral-50 hover:border-brand-300'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleInputChange}
            disabled={isLoading}
            className="hidden"
          />

          <label
            htmlFor="logo-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-8 sm:gap-4 sm:py-12"
          >
            <motion.div
              animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
              className="rounded-full bg-white p-3 shadow-sm"
            >
              <Upload className="h-6 w-6 text-brand-600" />
            </motion.div>

            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-900">
                {isLoading ? 'Uploading logo...' : 'Drag and drop your logo here'}
              </p>
              <p className="text-xs text-neutral-500">
                or click to select (PNG, JPG, SVG • max 5MB)
              </p>
            </div>

            {isLoading && (
              <div className="mt-2 flex gap-2 items-center">
                <div className="h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                <span className="text-xs text-neutral-600">Processing...</span>
              </div>
            )}
          </label>
        </motion.div>
      )}

      {/* Logo Preview */}
      <AnimatePresence>
        {logo && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <Image
                  src={logo}
                  alt="Brand Logo"
                  width={64}
                  height={64}
                  className="rounded-md object-contain bg-neutral-100 border border-neutral-200"
                />
              </div>

              {/* Success Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-emerald-900">
                    Logo uploaded successfully
                  </p>
                </div>
                <p className="text-xs text-neutral-600">
                  Colors have been automatically extracted from your logo.
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleReset}
                className="flex-shrink-0 p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-md hover:bg-neutral-100"
                aria-label="Remove logo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3 items-start"
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">Upload failed</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => {}}
              className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Colors Preview (if available) */}
      {logo && (() => {
        const colorList = [
          { name: 'Primary', key: 'primary' as const },
          { name: 'Secondary', key: 'secondary' as const },
          { name: 'Accent', key: 'accent' as const },
          { name: 'Background', key: 'background' as const },
          { name: 'Text', key: 'text' as const },
        ];

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-5 gap-2"
          >
            {colorList.map(({ name, key }) => (
              <div key={key} className="text-center">
                <div
                  className="h-10 rounded-md border border-neutral-200 mb-2 shadow-sm"
                  style={{ backgroundColor: colors?.[key] }}
                  title={`${name}: ${colors?.[key]}`}
                />
                <p className="text-xs font-medium text-neutral-600">{name}</p>
              </div>
            ))}
          </motion.div>
        );
      })()}
    </div>
  );
}
