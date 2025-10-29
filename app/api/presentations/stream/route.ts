import { NextRequest, NextResponse } from 'next/server';
import {
  geminiClient,
  InvalidAPIKeyError,
  GenerationError,
  PresentationResponse,
  Slide,
} from '@/lib/ai';
import {
  buildPresentationPrompt,
  GeneratePresentationRequestSchema,
  validatePresentationResponse,
} from '@/lib/ai/gemini/prompts';
import { IncrementalJsonParser } from '@/lib/utils/json-parser';

export const runtime = 'edge';
export const maxDuration = 60;

const STREAM_TIMEOUT = 55000; // 55 seconds (under 60s edge limit)

interface SSEEvent<T = unknown> {
  type: 'chunk' | 'slide' | 'complete' | 'error';
  data: T;
}

interface ErrorData {
  code: string;
  message: string;
}

/**
 * POST /api/presentations/stream
 *
 * Streams presentation generation via Server-Sent Events
 *
 * Request:
 * {
 *   "prompt": "Create a presentation about...",
 *   "numSlides": 5
 * }
 *
 * Response: text/event-stream with events:
 * - event: chunk | type: "chunk", data: string
 * - event: slide | type: "slide", data: Slide object
 * - event: complete | type: "complete", data: PresentationResponse
 * - event: error | type: "error", data: { code, message }
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  let streamClosed = false;

  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest =
      GeneratePresentationRequestSchema.parse(body);

    // Build prompt
    const fullPrompt = buildPresentationPrompt(
      validatedRequest.prompt,
      validatedRequest.numSlides
    );

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const parser = new IncrementalJsonParser();
        let fullText = '';
        let parsedPresentation: PresentationResponse | null = null;
        const startTime = Date.now();

        try {
          // Stream from Gemini
          for await (const chunk of geminiClient.streamGenerateContent(
            fullPrompt
          )) {
            // Check timeout
            if (Date.now() - startTime > STREAM_TIMEOUT) {
              throw new GenerationError('Stream timeout exceeded');
            }

            if (streamClosed) break;

            const text = chunk.text || '';
            fullText += text;

            // Send chunk event
            const chunkEvent: SSEEvent<string> = {
              type: 'chunk',
              data: text,
            };
            controller.enqueue(
              encoder.encode(
                `event: chunk\ndata: ${JSON.stringify(chunkEvent)}\n\n`
              )
            );

            // Try to parse complete objects (not currently used as Gemini returns full JSON)
            const objects = parser.feed(text);

            for (const obj of objects) {
              if (obj && typeof obj === 'object') {
                // Try to parse as Slide
                if ('id' in obj && 'type' in obj) {
                  try {
                    const slideEvent: SSEEvent<Slide> = {
                      type: 'slide',
                      data: obj as Slide,
                    };
                    controller.enqueue(
                      encoder.encode(
                        `event: slide\ndata: ${JSON.stringify(slideEvent)}\n\n`
                      )
                    );
                  } catch {
                    // Invalid slide, continue
                  }
                }
              }
            }
          }

          // Try to parse final presentation from accumulated text
          // Remove markdown code blocks if present
          let cleanedText = fullText;
          if (cleanedText.includes('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          } else if (cleanedText.includes('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
          }
          
          // Trim whitespace
          cleanedText = cleanedText.trim();
          
          // Try to parse and send slides
          try {
            const parsed = JSON.parse(cleanedText);
            parsedPresentation = validatePresentationResponse(parsed);

            // Send all slides as individual events
            if (parsedPresentation.slides) {
              for (const slide of parsedPresentation.slides) {
                const slideEvent: SSEEvent<Slide> = {
                  type: 'slide',
                  data: slide,
                };
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify(slideEvent)}\n\n`
                  )
                );
              }
            }
          } catch (parseError) {
            console.error('[API] Failed to parse presentation:', parseError instanceof Error ? parseError.message : 'Unknown error');
          }

          // Send complete event
          const completeEvent: SSEEvent<PresentationResponse | null> = {
            type: 'complete',
            data: parsedPresentation,
          };
          controller.enqueue(
            encoder.encode(
              `event: complete\ndata: ${JSON.stringify(completeEvent)}\n\n`
            )
          );

          controller.close();
          streamClosed = true;
        } catch (error) {
          const errorData: ErrorData = {
            code: 'GENERATION_ERROR',
            message: 'Unknown error occurred',
          };

          if (error instanceof InvalidAPIKeyError) {
            errorData.code = 'INVALID_API_KEY';
            errorData.message = 'API key not configured or invalid';
          } else if (error instanceof GenerationError) {
            errorData.code = 'GENERATION_ERROR';
            errorData.message = error.message;
          } else if (error instanceof Error) {
            errorData.message = error.message;
          }

          const errorEvent: SSEEvent<ErrorData> = {
            type: 'error',
            data: errorData,
          };
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`
            )
          );

          controller.close();
          streamClosed = true;
        }
      },

      cancel() {
        streamClosed = true;
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    // Request validation error
    const statusCode =
      error instanceof InvalidAPIKeyError ? 401 : 400;
    const message =
      error instanceof Error ? error.message : 'Invalid request';

    return NextResponse.json(
      {
        error: {
          code: 'REQUEST_ERROR',
          message,
        },
      },
      { status: statusCode }
    );
  }
}
