import { z } from 'zod';

// ============ ZOD SCHEMAS ============

const SpeakerNotesSchema = z.object({
  script: z
    .string()
    .min(100)
    .max(1000)
    .describe('2-3 paragraphs of natural, conversational delivery notes'),
  duration: z
    .string()
    .regex(/^\d+(?:min\s+)?\d+s$/)
    .describe('Estimated speaking time (e.g., "2min 30s")'),
  tips: z
    .array(z.string().min(10).max(200))
    .min(1)
    .max(3)
    .describe('Delivery tips and talking points'),
  keyPoints: z
    .array(z.string().min(10).max(100))
    .min(2)
    .max(4)
    .describe('Key points to emphasize'),
});

const SlideSchema = z.object({
  id: z
    .string()
    .regex(/^slide-\d+$/)
    .describe('Unique slide ID (format: slide-X)'),
  type: z
    .enum(['title', 'content', 'conclusion'])
    .describe('Slide type'),
  title: z
    .string()
    .min(3)
    .max(100)
    .describe('Slide title or heading'),
  bullets: z
    .array(z.string().min(5).max(120))
    .min(3)
    .max(5)
    .describe('3-5 bullet points, each max 2 lines'),
  speakerNotes: SpeakerNotesSchema,
  imagePrompt: z
    .string()
    .min(20)
    .max(300)
    .describe('Detailed description for AI image generation'),
});

export const PresentationResponseSchema = z.object({
  title: z
    .string()
    .min(5)
    .max(100)
    .describe('Presentation title'),
  subtitle: z
    .string()
    .min(5)
    .max(200)
    .describe('Presentation subtitle or tagline'),
  slides: z
    .array(SlideSchema)
    .describe('Array of slides'),
});

// Validation function
export function validatePresentationResponse(
  data: unknown
): z.infer<typeof PresentationResponseSchema> {
  return PresentationResponseSchema.parse(data);
}

// Type exports
export type SpeakerNotes = z.infer<typeof SpeakerNotesSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type PresentationResponse = z.infer<typeof PresentationResponseSchema>;

// ============ PROMPT BUILDERS ============

export function buildPresentationPrompt(
  userPrompt: string,
  numSlides: number
): string {
  const slidePlural = numSlides === 1 ? 'slide' : 'slides';

  return `You are an expert presentation designer and content strategist. Create a professional, engaging ${numSlides}-${slidePlural} presentation based on the user's request.

USER REQUEST: "${userPrompt}"

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${numSlides} slides (no more, no less)
2. Slide types: First slide MUST be "title", last slide MUST be "conclusion", middle slides are "content"
3. Each bullet point must be 5-120 characters (fit in 2 lines max)
4. Include 3-5 bullets per slide (never more)
5. Use professional, data-driven language
6. Speaker notes must be natural and conversational (2-3 paragraphs)
7. Estimated duration should be realistic (typically 1.5-3 min per slide)

SPEAKER NOTES GUIDELINES:
- Write as if the presenter is speaking directly to the audience
- Include natural transitions between slides
- Add relevant statistics or examples when appropriate
- Provide delivery tips and confidence boosters
- Highlight 2-4 key points per slide

IMAGE PROMPTS:
- Describe what image would support each slide's message
- Be specific about style, composition, and mood
- Example: "Professional chart showing growth trends with blue and green colors, clean minimalist design"

RESPONSE FORMAT: Return ONLY valid JSON (no markdown, no code blocks, no extra text):
{
  "title": "Presentation Title",
  "subtitle": "Tagline or Brief Description",
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "title": "Main Topic",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
      "speakerNotes": {
        "script": "Welcome everyone... [2-3 paragraphs]",
        "duration": "1min 30s",
        "tips": ["Make eye contact", "Smile and engage"],
        "keyPoints": ["Establish credibility", "Set expectations"]
      },
      "imagePrompt": "Description of image for this slide"
    }
  ]
}

Remember: EXACTLY ${numSlides} slides. Invalid JSON will cause failure.`;
}

export function buildBrandKitPrompt(userBrand: string): string {
  return `Analyze this brand description and suggest a professional color palette and typography:

BRAND: "${userBrand}"

Return ONLY valid JSON:
{
  "colors": {
    "primary": "#HEXcode",
    "secondary": "#HEXcode",
    "accent": "#HEXcode",
    "background": "#HEXcode",
    "text": "#HEXcode"
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name"
  }
}`;
}

export function buildImageGenerationPrompt(
  slideTitle: string,
  imagePrompt: string
): string {
  return `Generate a professional presentation slide image for:

SLIDE: "${slideTitle}"
REQUIREMENTS: "${imagePrompt}"

Make it: professional, clean, modern, suitable for business presentations
Style: minimalist with strong visual hierarchy
Color palette: use complementary colors, ensure good contrast
Resolution: 1920x1080

Return ONLY the image description prompt suitable for image generation APIs.`;
}
