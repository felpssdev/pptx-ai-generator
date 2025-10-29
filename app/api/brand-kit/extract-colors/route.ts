import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getDominantColors, generatePalette, BrandColors } from '@/lib/utils/color-extraction';
import { z } from 'zod';

/**
 * Request schema
 */
const ExtractColorsRequestSchema = z.object({
  logoBase64: z.string().min(10).describe('Base64 encoded image'),
});

/**
 * Response schema
 */
interface ExtractColorsResponse {
  success: boolean;
  colors?: BrandColors;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * POST /api/brand-kit/extract-colors
 *
 * Extract dominant colors from a brand logo
 *
 * Request: { logoBase64: "data:image/...;base64,..." }
 * Response: { success: true, colors: BrandColors }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ExtractColorsResponse>> {
  try {
    // Parse request body
    const body = await request.json();
    const validatedRequest = ExtractColorsRequestSchema.parse({
      logoBase64: body.logoBase64,
    });

    // Extract base64 data
    const base64Data = validatedRequest.logoBase64.split(',')[1] || validatedRequest.logoBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Process image with sharp
    const { data } = await sharp(imageBuffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Extract dominant colors
    const dominantColors = getDominantColors(data, 8);

    // Generate palette
    const colors = generatePalette(dominantColors);

    return NextResponse.json(
      {
        success: true,
        colors,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.issues[0]?.message || 'Invalid request format',
          },
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXTRACTION_ERROR',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
