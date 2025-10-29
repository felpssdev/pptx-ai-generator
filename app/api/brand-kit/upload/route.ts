import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import {
  ALLOWED_FORMATS,
  MAX_FILE_SIZE,
  LOGO_MAX_WIDTH,
  LOGO_MAX_HEIGHT,
  validateFileType,
  validateFileSize,
  getFileExtension,
  UploadResponse,
  UploadError,
} from '@/lib/utils/upload-validation';

/**
 * POST /api/brand-kit/upload
 *
 * Upload and optimize a brand logo
 *
 * Request: FormData with 'file' field
 * Response: { success: boolean, logo?: string, error?: { code, message } }
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      const error: UploadError = {
        code: 'NO_FILE',
        message: 'No file provided',
      };
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type)) {
      const error: UploadError = {
        code: 'INVALID_TYPE',
        message: `Invalid file format. Allowed: PNG, JPEG, SVG. Got: ${file.type}`,
      };
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      const error: UploadError = {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum of 5MB. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Process image with sharp
    let processedBuffer: Buffer;

    if (file.type === 'image/svg+xml') {
      // Keep SVG as-is (sharp doesn't handle SVG well)
      processedBuffer = fileBuffer;
    } else {
      // Optimize and resize non-SVG images
      processedBuffer = await sharp(fileBuffer)
        .resize(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();
    }

    // Convert to base64
    const base64Logo = processedBuffer.toString('base64');

    return NextResponse.json(
      {
        success: true,
        logo: `data:${file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp'};base64,${base64Logo}`,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    const uploadError: UploadError = {
      code: 'UPLOAD_ERROR',
      message: errorMessage,
    };

    return NextResponse.json(
      { success: false, error: uploadError },
      { status: 500 }
    );
  }
}
