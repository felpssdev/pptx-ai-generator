import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  parsePromptToKeywords,
  searchUnsplashImages,
  createImageResponse,
  ImageGenerationResponse,
} from '@/lib/utils/image-utils';

export const runtime = 'nodejs';

/**
 * Request schema validation
 */
const generateImageRequestSchema = z.object({
  prompt: z.string().min(1).max(500),
});

export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;

/**
 * POST /api/images/generate
 *
 * Generate an image from a text prompt using Unsplash API
 *
 * Request body:
 * ```json
 * { "prompt": "string" }
 * ```
 *
 * Response:
 * ```json
 * { "url": "string | null", "alt": "string" }
 * ```
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate request
    const body = (await req.json()) as unknown;
    const { prompt } = generateImageRequestSchema.parse(body);

    // Check for API key
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashKey) {
      console.warn('UNSPLASH_ACCESS_KEY not configured');
      return NextResponse.json(
        {
          url: null,
          alt: prompt,
        } as ImageGenerationResponse,
        { status: 200 }
      );
    }

    // Parse keywords from prompt
    const keywords = parsePromptToKeywords(prompt);

    if (!keywords.length) {
      return NextResponse.json(
        {
          url: null,
          alt: prompt,
        } as ImageGenerationResponse,
        { status: 200 }
      );
    }

    // Search Unsplash for images
    const image = await searchUnsplashImages(keywords, unsplashKey);

    // Create response
    const response = createImageResponse(image, prompt);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Image generation error:', error);

    return NextResponse.json(
      {
        url: null,
        alt: 'Image generation failed',
      } as ImageGenerationResponse,
      { status: 200 }
    );
  }
}
