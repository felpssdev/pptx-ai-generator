/**
 * Upload validation constants and types
 */

export const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/svg+xml'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const LOGO_MAX_WIDTH = 800;
export const LOGO_MAX_HEIGHT = 600;

export interface UploadError {
  code: string;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  logo?: string; // base64 encoded image
  error?: UploadError;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
  return ALLOWED_FORMATS.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Get file extension from mime type
 */
export function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'unknown';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
