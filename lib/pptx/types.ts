import { SpeakerNotes } from '@/lib/types/speaker-notes';
import { Template } from '@/lib/templates/types';

/**
 * Brand Kit interface (simplified for PPTX generation)
 */
export interface BrandKit {
  logo?: string; // Base64 or URL
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

/**
 * Slide interface for PPTX generation
 */
export interface Slide {
  id: string;
  type: 'title' | 'content' | 'conclusion';
  title: string;
  bullets: string[];
  speakerNotes: SpeakerNotes;
  imageUrl?: string;
}

/**
 * PPTX generation options
 */
export interface PPTXGenerationOptions {
  slides: Slide[];
  brandKit: BrandKit;
  template: Template;
  presentationTitle?: string;
  presentationSubtitle?: string;
}

/**
 * PPTX generation result
 */
export interface PPTXGenerationResult {
  success: boolean;
  filename: string;
  error?: string;
}
