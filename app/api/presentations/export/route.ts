import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePPTX } from '@/lib/pptx';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

/**
 * Request schema validation
 */
const exportPPTXRequestSchema = z.object({
  slides: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['title', 'content', 'conclusion']),
      title: z.string(),
      bullets: z.array(z.string()),
      speakerNotes: z.object({
        script: z.string(),
        duration: z.string(),
        tips: z.array(z.string()),
        keyPoints: z.array(z.string()),
      }),
      imageUrl: z.string().optional(),
    })
  ),
  brandKit: z.object({
    logo: z.string().optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
  }),
  template: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    preview: z.string(),
    colors: z.object({
      background: z.string(),
      title: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
    fonts: z.object({
      title: z.string(),
      body: z.string(),
    }),
    layout: z.enum(['standard', 'sidebar', 'minimal']),
  }),
  presentationTitle: z.string().optional(),
  presentationSubtitle: z.string().optional(),
});

export type ExportPPTXRequest = z.infer<typeof exportPPTXRequestSchema>;

/**
 * POST /api/presentations/export
 *
 * Export presentation to PPTX format
 *
 * Request body:
 * ```json
 * {
 *   "slides": [...],
 *   "brandKit": {...},
 *   "template": {...},
 *   "presentationTitle": "string",
 *   "presentationSubtitle": "string"
 * }
 * ```
 *
 * Response:
 * - 200: PPTX file as blob with Content-Disposition header
 * - 400: Invalid request schema
 * - 500: Generation error
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate request
    const body = (await req.json()) as unknown;
    const validatedData = exportPPTXRequestSchema.parse(body);

    // Generate PPTX
    const result = await generatePPTX({
      slides: validatedData.slides,
      brandKit: validatedData.brandKit,
      template: validatedData.template,
      presentationTitle: validatedData.presentationTitle,
      presentationSubtitle: validatedData.presentationSubtitle,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to generate PPTX',
          details: result.error,
        },
        { status: 500 }
      );
    }

    // Read generated file
    const filePath = path.join(process.cwd(), result.filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          error: 'Generated file not found',
        },
        { status: 500 }
      );
    }

    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Delete temporary file
    fs.unlinkSync(filePath);

    // Create response with file download
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    return response;
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

    console.error('Export error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
