'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePresentationStore } from '@/lib/store';
import { PresentationMode } from '@/components/presentation';
import { SpeakerNotes } from '@/lib/types/speaker-notes';

interface Slide {
  id: string;
  type: 'title' | 'content' | 'conclusion';
  title: string;
  bullets: string[];
  speakerNotes: SpeakerNotes;
  imagePrompt: string;
  imageUrl?: string;
}

interface PresentationPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Presentation Page Component
 *
 * Fullscreen presentation mode with:
 * - PresentationMode component
 * - Keyboard controls (→, ←, Esc)
 * - Speaker notes
 * - Timer and progress
 */
export default function PresentationPage({
  params,
}: PresentationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { presentation } = usePresentationStore();

  // Handle exit - return to preview page
  const handleExit = () => {
    router.push(`/preview/${id}`);
  };

  if (!presentation) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-lg font-medium">
            Loading presentation...
          </p>
        </div>
      </div>
    );
  }

  // Transform stored slides to match PresentationMode interface
  const slides: Slide[] = presentation.slides.map(
    (slide: Record<string, unknown>) => {
      const speakerNotes = slide.speakerNotes as Partial<SpeakerNotes> | undefined;
      
      return {
        id: String(slide.id),
        type: (slide.type as 'title' | 'content' | 'conclusion') || 'content',
        title: String(slide.title),
        bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
        speakerNotes: {
          script: speakerNotes?.script || '',
          duration: speakerNotes?.duration || '0min',
          tips: Array.isArray(speakerNotes?.tips) ? speakerNotes.tips : [],
          keyPoints: Array.isArray(speakerNotes?.keyPoints)
            ? speakerNotes.keyPoints
            : [],
        },
        imagePrompt: String(slide.imagePrompt || ''),
        imageUrl: slide.imageUrl ? String(slide.imageUrl) : undefined,
      };
    }
  );

  return (
    <PresentationMode
      slides={slides}
      onExit={handleExit}
    />
  );
}
